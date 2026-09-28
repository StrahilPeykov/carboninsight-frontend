"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { companyApi } from "@/lib/api/companyApi";

const inputs = [
  ["Materials", "Components, quantities and supplier data"],
  ["Production", "Energy used to make your product"],
  ["Transport", "Distances and modes of transport"],
  ["Use", "Energy consumed during the product’s use"],
];

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const [companyState, setCompanyState] = useState<"loading" | "empty" | "existing" | "error">(
    "loading"
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    setCompanyState("loading");
    companyApi.listCompanies().then(
      companies => {
        if (!cancelled) setCompanyState(companies.length ? "existing" : "empty");
      },
      () => {
        if (!cancelled) setCompanyState("error");
      }
    );
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const loading = isLoading || (isAuthenticated && companyState === "loading");
  const href = !isAuthenticated
    ? "/register"
    : companyState === "empty"
      ? "/create-company"
      : "/list-companies";
  const label = !isAuthenticated
    ? "Create an account"
    : companyState === "empty"
      ? "Create your company"
      : "Open your companies";
  const actionClass =
    "inline-flex items-center justify-center gap-3 rounded-md bg-red px-6 py-3 font-semibold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <section
        className="grid gap-10 py-10 sm:py-12 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-16"
        aria-labelledby="home-title"
      >
        <div>
          <p className="mb-5 font-semibold text-red dark:text-red-400">
            CarbonInsight / For manufacturers
          </p>
          <h1
            id="home-title"
            className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl"
          >
            Understand your product’s carbon footprint.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            Bring together material, energy and transport data. Calculate emissions, see where they
            come from, and prepare a carbon footprint report.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            {loading ? (
              <button disabled className={`${actionClass} opacity-60`}>
                Loading your account…
              </button>
            ) : (
              <Link href={href} className={actionClass}>
                {label}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            )}
            {!isLoading && !isAuthenticated && (
              <Link href="/login" className="font-medium underline underline-offset-4">
                Sign in
              </Link>
            )}
          </div>
          <p className="mt-5 text-sm text-gray-600 dark:text-gray-400">
            Start with a company profile, then add your first product.
          </p>
        </div>
        <aside
          className="bg-white p-6 sm:p-8 dark:bg-gray-900"
          aria-labelledby="inputs-title"
        >
          <h2 id="inputs-title" className="text-xl font-bold">
            What you’ll work with
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            Gather the data for the product you want to assess.
          </p>
          <dl className="mt-5 divide-y divide-gray-200 dark:divide-gray-700">
            {inputs.map(([title, description]) => (
              <div key={title} className="py-4 first:pt-0 last:pb-0">
                <dt className="font-semibold">{title}</dt>
                <dd className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>
      <section
        className="border-t border-gray-300 py-8 sm:py-9 dark:border-gray-700"
        aria-labelledby="workflow-title"
      >
        <h2 id="workflow-title" className="text-2xl font-bold">
          From product data to a report
        </h2>
        <ol className="mt-7 grid gap-7 md:grid-cols-3 md:gap-10">
          {[
            [
              "Set up your product",
              "Create or select a company, add a product, and enter its materials and components.",
            ],
            [
              "Calculate and review",
              "Add energy and transport data, then review the emissions breakdown for your product.",
            ],
            [
              "Prepare your report",
              "Check the underlying data and export a carbon footprint report to share.",
            ],
          ].map(([title, description], index) => (
            <li key={title} className="flex gap-4">
              <span
                className="pt-1 text-sm font-semibold text-red dark:text-red-400"
                aria-hidden="true"
              >
                0{index + 1}
              </span>
              <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 leading-relaxed text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
