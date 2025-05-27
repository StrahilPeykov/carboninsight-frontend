"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { DataPassedToTabs, TabHandle } from "../page";
import { Mode } from "../enums";

const Transportation = forwardRef<TabHandle, DataPassedToTabs>(
  ({ productId, tabKey, mode, setProductId, onFieldChange }, ref) => {
    const company_pk = localStorage.getItem("selected_company_id");
    const access_token = localStorage.getItem("access_token");

    useImperativeHandle(ref, () => ({ saveTab, updateTab }));

    const saveTab = async (): Promise<string> => {
      return "";
    };

    const updateTab = async (): Promise<string> => {
      return "";
    };

    // Fetch all BoM data
    useEffect(() => {
      if (mode == Mode.EDIT) {
        // TODO: fetch data here if needed
      }
    }, [mode]);

    // Example JSX return, adjust as needed for your UI
    return <div>Transportation Tab for product {productId}</div>;
  }
);

Transportation.displayName = "Transportation";
export default Transportation;
