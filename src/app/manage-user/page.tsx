"use client";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash, X } from "lucide-react";
import { companyApi, AuthenticatedUser } from "@/lib/api/companyApi";
import { useAuth } from "../context/AuthContext";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import { Column, OurTable } from "../components/ui/OurTable";

export default function ManageUserPage() {
  const router = useRouter();
  const { isLoading, requireAuth } = useAuth();

  // Require authentication for this page
  requireAuth();

  const [companyId, setCompanyId] = useState<string | null>(null);

  // User management state
  const [users, setUsers] = useState<AuthenticatedUser[]>([]);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);

  // Modal and form state
  const [activeAddingModal, setAddingModal] = useState(false);
  const [userToAdd, setUserToAdd] = useState<string>("");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [addingMessage, setAddingMessage] = useState<string | null>(null);
  const [addingError, setAddingError] = useState<string | null>(null);

  const [activeRemovingModal, setRemovingModal] = useState(false);
  const [userToRemove, setUserToRemove] = useState<string>("");
  const [userIdToRemove, setUserIdToRemove] = useState<number | null>(null);
  const [isRemovingUser, setIsRemovingUser] = useState(false);
  const [removalMessage, setRemovalMessage] = useState<string | null>(null);
  const [removingError, setRemovingError] = useState<string | null>(null);

  // Check authentication and get company ID
  useEffect(() => {
    const id = localStorage.getItem("selected_company_id");
    if (!id) {
      router.push("/list-companies");
      return;
    }
    setCompanyId(id);
  }, [router]);

  // Fetch users when company ID changes or refresh is needed
  useEffect(() => {
    if (!companyId) return;

    const fetchUsers = async () => {
      try {
        setDataLoading(true);
        if (companyId) {
          // Explicit null check for TypeScript
          const userData = await companyApi.listUsers(companyId);
          setUsers(userData);
          setLoadingError(null);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setLoadingError(err instanceof Error ? err.message : "Failed to load authorized users");
      } finally {
        setDataLoading(false);
      }
    };

    fetchUsers();
  }, [companyId, refreshKey]);

  const handleAddingUser = async () => {
    if (!userToAdd || !companyId || isAddingUser) return;

    setIsAddingUser(true);
    setRemovalMessage(null);
    setRemovingError(null);
    setAddingError(null);

    try {
      await companyApi.addUser(companyId, userToAdd);
      setAddingMessage(`Successfully added ${userToAdd} to the company!`);
      setRefreshKey(prev => prev + 1); // Trigger a refresh of the users list
      setUserToAdd("");
    } catch (err) {
      console.error("Error adding user:", err);
      setAddingError(err instanceof Error ? err.message : "Failed to add user to company");
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleRemovingUser = async () => {
    if (!userToRemove || !companyId || !userIdToRemove || isRemovingUser) return;

    setIsRemovingUser(true);
    setAddingError(null);
    setAddingMessage(null);
    setRemovingError(null);

    try {
      await companyApi.removeUser(companyId, userIdToRemove);
      setRemovalMessage(`Successfully removed ${userToRemove} from the company!`);
      setRefreshKey(prev => prev + 1); // Trigger a refresh of the users list
      setUserToRemove("");
      setUserIdToRemove(null);
    } catch (err) {
      console.error("Error removing user:", err);
      setRemovingError(err instanceof Error ? err.message : "Failed to remove user from company");
    } finally {
      setIsRemovingUser(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LoadingSkeleton />
      </div>
    );
  }

  // We define the columns that will be used in the table.
  // key: is the key of the actual datatype.
  // label: the header label we will display.
  // render: modifications we will do to the rendering of the value.
  const columns: Column<AuthenticatedUser>[] = [
    { key: "email", label: "Email" },
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    {
      key: "actions",
      label: "Remove",
      render: (_value, user) => (
        <Button
          size="sm"
          className="flex items-center gap-1 text-xs !bg-red-500 !border-red-500 !text-white hover:cursor-pointer"
          onClick={e => {
            e.stopPropagation();
            setUserIdToRemove(user.id);
            setUserToRemove(user.username);
            setRemovingModal(true);
          }}
        >
          <Trash className="w-4 h-4 text-white" />
        </Button>
      ),
    },
  ];

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Modal Adding User */}
      {activeAddingModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/75 z-50">
          <Card className="">
            <div className="flex flex-col justify-center items-center gap-5">
              <div className="flex w-full">
                <div className="grow flex justify-start items-center text-2xl font-bold">
                  Add User
                </div>
                <button
                  onClick={() => setAddingModal(false)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="w-100 max-w-full">
                Type the username of the user you want to authenticate for this company.
              </div>
              <input
                type="text"
                id="User to Authenticate"
                name="Username"
                value={userToAdd}
                onChange={e => setUserToAdd(e.target.value)}
                placeholder="Enter a username"
                className="w-full border dark:border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Display Adding Message */}
              {addingMessage && (
                <div className="w-100 max-w-full text-center text-green-500 rounded-md">
                  {addingMessage}
                </div>
              )}

              {/* Display Adding Error */}
              {addingError && (
                <div className="w-100 max-w-full text-center text-red-500 rounded-md">
                  {addingError}
                </div>
              )}

              <Button className="w-full" onClick={() => handleAddingUser()}>
                Add User To Company
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Removing User */}
      {activeRemovingModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/75 z-50">
          <Card className="">
            <div className="flex flex-col justify-center items-center gap-5">
              <div className="flex w-full">
                <div className="grow flex justify-start items-center text-2xl font-bold">
                  Remove User
                </div>
                <button
                  onClick={() => setRemovingModal(false)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="w-100 max-w-full">
                Are you sure you want to remove {userToRemove} from this company?
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  handleRemovingUser();
                  setRemovingModal(false);
                }}
              >
                Remove User
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="w-full flex flex-col justify-self-center">
        <div className="flex flex-wrap justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Manage Authorized Users</h1>
            <h2 className="text-md dark:text-gray-400">
              View or remove users from the company here.
            </h2>
          </div>
          <div className="flex items-end">
            <Button
              className="w-3xs mt-6 hover:cursor-pointer"
              onClick={() => setAddingModal(true)}
            >
              Add user
            </Button>
          </div>
        </div>

        {/* Display Removal Message or Error */}
        {removalMessage && <div className="text-green-500 rounded-md mb-6">{removalMessage}</div>}
        {removingError && <div className="text-red-500 rounded-md mb-6">{removingError}</div>}

        {/* Table */}
        {dataLoading ? (
          <div className="text-center py-6">Data loading...</div>
        ) : loadingError ? (
          <div className="text-red-500 text-center py-6">{loadingError}</div>
        ) : users.length === 0 ? (
          <div className="text-center py-6">No users found.</div>
        ) : (
          <Card>
            <OurTable
              caption="A table displaying the users of this company."
              items={users}
              columns={columns}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
