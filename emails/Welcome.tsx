import {  Html } from "@react-email/components";
import * as React from "react";

export default function Welcome() {
  return (
    <Html>
      <h1>BD Weather OTP</h1>
      <p
  
  style={{ background: "#000", color: "#fff", padding: "12px 20px" }}
>
  Your OTP is: {Math.floor(100000 + Math.random() * 900000)}
</p>
    </Html>
  );
}
