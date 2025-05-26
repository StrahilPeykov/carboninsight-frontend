"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";
import { DataPassedToTabs, TabHandle } from "../page";

const UserEnergy = forwardRef<TabHandle, DataPassedToTabs>(
  ({ productId, setProductId, onFieldChange, onTabSaved, onTabSaveError }, ref) => {
    const company_pk = localStorage.getItem("selected_company_id");
    const access_token = localStorage.getItem("access_token");

    useImperativeHandle(ref, () => ({ saveTab }));

    const saveTab = async (): Promise<boolean> => {
      onTabSaved();
      return true;
    };

    // Example JSX return, adjust as needed for your UI
    return <div>User Energy Tab for product {productId}</div>;
  }
);

UserEnergy.displayName = "UserEnergy";
export default UserEnergy;
