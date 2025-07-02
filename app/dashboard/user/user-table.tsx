"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useLocation } from "@/contexts/divisionContext";
import { Station } from "@/data/stations";
import { useSession } from "@/lib/auth-client";

// Define the User type based on Prisma schema
interface User {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  emailVerified: boolean;
  image: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: number | null;
  division: string;
  district: string;
  upazila: string;
  stationId: string;
  twoFactorEnabled: boolean | null;
  createdAt: string;
  updatedAt: string;
  station?: {
    id: string;
    name: string;
    securityCode: string;
  } | null;
}

// Define the role type
type UserRole = "super_admin" | "station_admin" | "observer";

export const UserTable = () => {
  // Get the current user session
  const { data: session } = useSession();

  // Use the location context for division, district, and upazila
  const {
    divisions,
    districts,
    upazilas,
    selectedDivision,
    setSelectedDivision,
    selectedDistrict,
    setSelectedDistrict,
    setSelectedUpazila,
    loading: locationLoading,
  } = useLocation();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openRoleUpdateDialog, setOpenRoleUpdateDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [originalRole, setOriginalRole] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  interface FormData {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    division: string;
    district: string;
    upazila: string;
    stationId: string;
  }

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    role: "observer",
    division: "",
    district: "",
    upazila: "",
    stationId: "",
  });

  // Loading states for dependent data
  const [loadingStations, setLoadingStations] = useState(false);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingUpazilas, setLoadingUpazilas] = useState(false);

  // Fetch stations from the API
  const fetchStations = useCallback(async () => {
    setLoadingStations(true);
    try {
      const response = await fetch("/api/stations");
      if (!response.ok) {
        throw new Error("Failed to fetch stations");
      }
      const data = await response.json();
      setStations(data);
    } catch (error) {
      console.error("Error fetching stations:", error);
      toast.error("Failed to load stations");
    } finally {
      setLoadingStations(false);
    }
  }, []);

  // Use useCallback to memoize the fetchUsers function
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use our custom API endpoint for listing users
      const response = await fetch(
        `/api/users?limit=${pageSize}&offset=${pageIndex * pageSize}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      console.log("API response:", data);

      // Set users and total from the API response
      setUsers(data.users);
      setTotalUsers(data.total);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, pageSize]);

  // Fetch stations when component mounts
  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  // Update loading states based on location context loading state
  useEffect(() => {
    setLoadingDivisions(locationLoading);
    setLoadingDistricts(locationLoading);
    setLoadingUpazilas(locationLoading);
  }, [locationLoading]);

  // Fetch users when page changes
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle station selection
  const handleStationChange = (stationId: string) => {
    const selectedStation = stations.find(
      (station) => station.id === stationId
    );

    if (selectedStation) {
      setFormData((prevData) => ({
        ...prevData,
        stationId: selectedStation?.id || "",
      }));
    }
  };

  // We're now handling form data updates directly in the select onValueChange handlers
  // This ensures the form data and location context stay in sync

  const handleCreateUser = async () => {
    try {
      // First check if role is selected
      if (!formData.role) {
        toast.error("Please select a role first");
        return;
      }

      // Validate required fields
      if (
        !formData.email ||
        !formData.password ||
        !formData.division ||
        !formData.district ||
        !formData.upazila
      ) {
        toast.error("Please fill all required fields");
        return;
      }

      // Validate password length based on role
      const passwordMinLength = {
        super_admin: 12,
        station_admin: 11,
        observer: 10,
      };

      const requiredLength = passwordMinLength[formData.role as UserRole];

      if (formData.password.length < requiredLength) {
        toast.error(
          `Password must be at least ${requiredLength} characters for ${formData.role} role`
        );
        return;
      }

      // Use the API to create a user
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          division: formData.division,
          district: formData.district,
          upazila: formData.upazila,
          stationId: formData.stationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create user");
      }

      toast.success("User created successfully");
      setOpenDialog(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error("Failed to create user:", error);
      toast.error(
        typeof error === "object" && error instanceof Error
          ? error.message
          : "Failed to create user"
      );
    }
  };

  // Function to confirm role changes before updating
  const confirmRoleUpdate = () => {
    if (!editUser) return;

    // First check if role is selected
    if (!formData.role) {
      toast.error("Please select a role first");
      return;
    }

    // Check if the role is actually changing
    if (editUser.role === formData.role) {
      // No role change, proceed with normal update
      handleUpdateUser();
      return;
    }

    // Store the original and new roles for the confirmation dialog
    setOriginalRole(editUser.role);
    setNewRole(formData.role);

    // Open the confirmation dialog
    setOpenRoleUpdateDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!editUser) return;

    try {
      console.log("Starting update process for user:", editUser.id);
      console.log("Current form data:", formData);

      // First check if role is selected
      if (!formData.role) {
        toast.error("Please select a role first");
        return;
      }

      // Validate required fields
      if (
        !formData.email ||
        !formData.division ||
        !formData.district ||
        !formData.upazila
      ) {
        toast.error("Please fill all required fields");
        return;
      }

      // Validate password length based on role if a new password is provided
      if (formData.password && formData.password.trim() !== "") {
        const passwordMinLength = {
          super_admin: 12,
          station_admin: 11,
          observer: 10,
        };

        const requiredLength = passwordMinLength[formData.role as UserRole];

        if (formData.password.length < requiredLength) {
          toast.error(
            `Password must be at least ${requiredLength} characters for ${formData.role} role`
          );
          return;
        }
      }

      // Close the role update dialog if it's open
      setOpenRoleUpdateDialog(false);

      // Prepare the update data - ensure all values are properly formatted
      const updateData = {
        id: editUser.id,
        name: formData.name || "",
        email: formData.email,
        password:
          formData.password && formData.password.trim() !== ""
            ? formData.password
            : undefined,
        role: formData.role,
        division: formData.division,
        district: formData.district,
        upazila: formData.upazila,
        stationId: formData.stationId,
      };

      // Remove any undefined values
      Object.keys(updateData).forEach((key) => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });

      console.log("Sending update request with data:", {
        ...updateData,
        password:
          formData.password && formData.password.trim() !== ""
            ? "[REDACTED]"
            : undefined,
      });

      // Use the custom API endpoint for updating users
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      console.log("Response status:", response.status);

      // Get the response text first
      const responseText = await response.text();
      console.log("Response text:", responseText);

      // Try to parse as JSON if possible
      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
        console.log("Parsed response data:", responseData);
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        responseData = {};
      }

      // Check if the response was successful
      if (!response.ok) {
        const errorMessage = responseData.error || "Failed to update user";
        console.error("API error response:", responseData);
        throw new Error(errorMessage);
      }

      toast.success("User updated successfully");
      setOpenDialog(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error(
        typeof error === "object" && error instanceof Error
          ? error.message
          : "Failed to update user"
      );
    }
  };

  const openDeleteConfirmation = (userId: string, userRole: string | null) => {
    // Check if user is trying to delete themselves
    if (session?.user?.id === userId) {
      toast.error("You cannot delete your own account");
      return;
    }

    // Super admin accounts can never be deleted
    if (userRole === "super_admin") {
      toast.error("Super admin accounts cannot be deleted");
      return;
    }

    // For all other cases, show the confirmation dialog
    setUserToDelete(userId);
    setOpenDeleteDialog(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      // Use the API to delete a user
      const response = await fetch(`/api/users?id=${userToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete user");
      }

      toast.success("User deleted successfully");
      setOpenDeleteDialog(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error(
        typeof error === "object" && error instanceof Error
          ? error.message
          : "Failed to delete user"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "observer",
      division: "",
      district: "",
      upazila: "",
      stationId: "",
    });
    setEditUser(null);
  };

  const openEditDialog = async (user: User) => {
    if (user.role === "super_admin") {
      toast.error("Super admin roles cannot be modified");
      return;
    }
    setEditUser(user);

    // If the user has a stationId, fetch the station to get the security code
    let securityCode = "";
    if (user.stationId) {
      try {
        // Find the station in our existing stations list
        const station = stations.find((s) => s.stationId === user.stationId);
        if (station) {
          securityCode = station.securityCode;
        }
      } catch (error) {
        console.error("Error fetching station details:", error);
      }
    }

    setFormData({
      name: user.name || "",
      email: user.email,
      password: "", // Don't set password when editing
      role: (user.role as UserRole) || "observer",
      division: user.division,
      district: user.district,
      upazila: user.upazila,
      stationId: user.stationId || "",
    });
    setOpenDialog(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setOpenDialog(true);
  };

  const nextPage = () => {
    if ((pageIndex + 1) * pageSize < totalUsers) {
      setPageIndex(pageIndex + 1);
    }
  };

  const prevPage = () => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          {session?.user.role === "super_admin" && (
            <DialogTrigger asChild>
              <Button
                className="bg-sky-600 hover:bg-sky-400"
                onClick={openCreateDialog}
              >
                + Create User
              </Button>
            </DialogTrigger>
          )}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editUser ? "Edit User" : "Create New User"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Name */}
              <div className="flex flex-col gap-2">
                <label htmlFor="name">Name</label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              {/* Role - Placed first for validation purposes */}
              {session?.user.role === "super_admin" && (
                <div className="flex flex-col gap-2">
                  <label htmlFor="role">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => {
                      const role = value as UserRole;
                      setFormData({ ...formData, role });

                      // Display password requirement based on selected role
                      const passwordMinLength = {
                        super_admin: 12,
                        station_admin: 11,
                        observer: 10,
                      };

                      toast.info(
                        `Password must be at least ${passwordMinLength[role]} characters for ${role} role`
                      );
                    }}
                  >
                    <SelectTrigger id="role" className="w-full">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="station_admin">
                        Station Admin
                      </SelectItem>
                      <SelectItem value="observer">Observer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Email and Password */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="password" className="flex items-center gap-1">
                    {editUser ? "New Password" : "Password"}
                    {!editUser && <span className="text-red-500">*</span>}
                    {formData.role && (
                      <span className="text-xs text-blue-600 block">
                        {`Min ${formData.role === "super_admin" ? 12 : formData.role === "station_admin" ? 11 : 10} characters`}
                      </span>
                    )}
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={
                      formData.role
                        ? `Min ${formData.role === "super_admin" ? 12 : formData.role === "station_admin" ? 11 : 10} characters`
                        : "Select a role first"
                    }
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required={!editUser}
                    disabled={!formData.role} // Disable password field until role is selected
                  />
                </div>
              </div>

              {/* Station Name */}
              <div className="flex flex-col gap-2">
                <label htmlFor="stationName">Station Name</label>
                <Select
                  value={formData.stationId}
                  onValueChange={handleStationChange}
                  disabled={session?.user.role !== "super_admin"}
                >
                  <SelectTrigger id="stationName" className="w-full">
                    <SelectValue
                      placeholder={
                        loadingStations ? "Loading..." : "Select Station"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((station) => (
                      <SelectItem key={station.id} value={station.id}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Station ID */}
              <div className="flex flex-col gap-2">
                <label htmlFor="stationId">Station ID</label>
                <Input
                  id="stationId"
                  value={
                    stations.find(
                      (station) => station.id === formData.stationId
                    )?.stationId
                  }
                  className="bg-gray-100"
                  disabled
                  readOnly
                />
              </div>

              {/* Station Code (Security Code) */}
              <div className="flex flex-col gap-2">
                <label htmlFor="securityCode">
                  Station Code (Security Code)
                </label>
                <Input
                  id="securityCode"
                  value={
                    stations.find(
                      (station) => station.id === formData.stationId
                    )?.securityCode
                  }
                  className="bg-gray-100"
                  disabled
                  readOnly
                />
              </div>

              {/* Division, District, Upazila */}
              {session?.user.role === "super_admin" && (
                <div className="grid grid-cols-3 gap-4 w-full">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="division">
                      Division <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.division}
                      onValueChange={(value) => {
                        console.log("Division selected:", value);
                        const division = divisions.find(
                          (d) => d.name === value
                        );
                        if (division) {
                          // First update form data
                          setFormData((prevData) => ({
                            ...prevData,
                            division: value,
                            district: "",
                            upazila: "",
                          }));
                          // Then update selected division which will trigger district loading
                          setSelectedDivision(division);
                          // Reset other selections
                          setSelectedDistrict(null);
                          setSelectedUpazila(null);
                        }
                      }}
                      disabled={loadingDivisions}
                    >
                      <SelectTrigger id="division" className="w-full">
                        <SelectValue
                          placeholder={
                            loadingDivisions ? "Loading..." : "Select Division"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {divisions.map((division) => (
                          <SelectItem
                            key={division.osmId}
                            value={division.name}
                          >
                            {division.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="district">
                      District <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.district}
                      onValueChange={(value) => {
                        console.log("District selected:", value);
                        const district = districts.find(
                          (d) => d.name === value
                        );
                        if (district) {
                          // First update form data
                          setFormData((prevData) => ({
                            ...prevData,
                            district: value,
                            upazila: "",
                          }));
                          // Then update selected district which will trigger upazila loading
                          setSelectedDistrict(district);
                          // Reset upazila selection
                          setSelectedUpazila(null);
                        }
                      }}
                      disabled={!selectedDivision || districts.length === 0}
                    >
                      <SelectTrigger id="district" className="w-full">
                        <SelectValue
                          placeholder={
                            loadingDistricts ? "Loading..." : "Select District"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem
                            key={district.osmId}
                            value={district.name}
                          >
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="upazila">
                      Upazila <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.upazila}
                      onValueChange={(value) => {
                        console.log("Upazila selected:", value);
                        const upazila = upazilas.find((u) => u.name === value);
                        if (upazila) {
                          // Update form data
                          setFormData((prevData) => ({
                            ...prevData,
                            upazila: value,
                          }));
                          // Then update selected upazila
                          setSelectedUpazila(upazila);
                        }
                      }}
                      disabled={!selectedDistrict || upazilas.length === 0}
                    >
                      <SelectTrigger id="upazila" className="w-full">
                        <SelectValue
                          placeholder={
                            loadingUpazilas ? "Loading..." : "Select Upazila"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {upazilas.map((upazila) => (
                          <SelectItem key={upazila.osmId} value={upazila.name}>
                            {upazila.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={editUser ? confirmRoleUpdate : handleCreateUser}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editUser ? "Update User" : "Create User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className=" bg-white py-6 rounded-xl border shadow">
        <Table>
          <TableHeader className="border-b-2 border-slate-300 bg-slate-100">
            <TableRow>
              <TableHead className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                Name
              </TableHead>
              <TableHead className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                Email
              </TableHead>
              <TableHead className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                Role
              </TableHead>
              <TableHead className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                Station
              </TableHead>
              <TableHead className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                Joined
              </TableHead>
              <TableHead className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="p-3 text-left truncate max-w-[250px] text-base">
                    {user.name || "N/A"}
                  </TableCell>
                  <TableCell className="p-3 text-left truncate max-w-[250px] text-base">
                    {user.email}
                  </TableCell>
                  <TableCell className="p-3 text-left truncate max-w-[250px] text-base">
                    {user.role || "N/A"}
                  </TableCell>
                  <TableCell className="p-3 text-left truncate max-w-[250px] text-base">
                    {stations.find((station) => station.id === user.stationId)
                      ?.name || "N/A"}
                  </TableCell>
                  <TableCell className="p-3 text-left truncate max-w-[250px] text-base">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        Edit
                      </Button>
                      {session?.user.role === "super_admin" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            openDeleteConfirmation(user.id, user.role)
                          }
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between space-x-2 px-3 border-t pt-5">
          <div className="flex-1 text-sm text-muted-foreground">
            {totalUsers > 0 && (
              <>
                Showing {pageIndex * pageSize + 1} to{" "}
                {Math.min((pageIndex + 1) * pageSize, totalUsers)} of{" "}
                {totalUsers} users
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
              disabled={pageIndex === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={(pageIndex + 1) * pageSize >= totalUsers}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {session?.user?.role === "super_admin" && (
        <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">
                Confirm Deletion
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 text-center">
              <p className="mb-4">
                Are you sure you want to delete this user? This action cannot be
                undone.
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setOpenDeleteDialog(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteUser}>
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Role Update Confirmation Dialog */}
      <Dialog
        open={openRoleUpdateDialog}
        onOpenChange={setOpenRoleUpdateDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              Confirm Role Change
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p className="mb-4">
              Are you sure you want to change this user&apos;s role from{" "}
              <strong>{originalRole}</strong> to <strong>{newRole}</strong>?
            </p>
            <p className="mb-4 text-amber-600">
              Changing user roles affects their permissions and access levels in
              the system.
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setOpenRoleUpdateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  setOpenRoleUpdateDialog(false);
                  // Small delay to ensure dialog closes before submitting
                  setTimeout(() => handleUpdateUser(), 100);
                }}
              >
                Confirm Change
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
