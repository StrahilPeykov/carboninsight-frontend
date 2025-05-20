"use client";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "lucide-react";
import { companyApi, AuthenticatedUser } from "@/lib/api/companyApi";

export default function ManageUserPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);

  // User management state
  const [users, setUsers] = useState<AuthenticatedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
    }

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
        setIsLoading(true);
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
        setIsLoading(false);
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

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Modal Adding User */}
      {activeAddingModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/75 z-50">
          <Card className="">
            <div className="flex flex-col justify-center items-center gap-5">
              <div className="flex w-full">
                <Button className="invisible flex-none"> X </Button>
                <div className="grow flex justify-center items-center px-4 text-2xl font-bold">
                  {" "}
                  Add User{" "}
                </div>
                <Button className="flex-none" onClick={() => setAddingModal(false)}>
                  {" "}
                  X{" "}
                </Button>
              </div>
              <div className="w-100 max-w-full text-center">
                {" "}
                Type the username of the user you want to authenticate for this company.{" "}
              </div>
              <input
                type="text"
                id="User to Authenticate"
                name="Username"
                value={userToAdd}
                onChange={e => setUserToAdd(e.target.value)}
                placeholder="Enter a username"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                {" "}
                Add User To Company{" "}
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
                <Button className="invisible flex-none"> X </Button>
                <div className="grow flex justify-center items-center px-4 text-2xl font-bold">
                  {" "}
                  Remove User{" "}
                </div>
                <Button className="flex-none" onClick={() => setRemovingModal(false)}>
                  {" "}
                  X{" "}
                </Button>
              </div>
              <div className="w-100 max-w-full text-center">
                {" "}
                Are you sure you want to remove {userToRemove} from this company?{" "}
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  handleRemovingUser();
                  setRemovingModal(false);
                }}
              >
                {" "}
                Remove User{" "}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="flex flex-col justify-self-center items-center gap-8">
        <div className="font-bold text-4xl text-center w-auto"> Manage Authorized Users </div>

        <Button className="w-auto" onClick={() => setAddingModal(true)}>
          {" "}
          Add user{" "}
        </Button>

        {/* Display Removal Message */}
        {removalMessage && <div className="text-green-500 rounded-md">{removalMessage}</div>}

        {/* Display Removing Error */}
        {removingError && <div className="text-red-500 rounded-md">{removingError}</div>}

        {/* Table */}
        <Card className="max-w-[90vw]">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="border-b uppercase text-xl">
                <tr>
                  <th className="py-3 px-6 text-left">Username</th>
                  <th className="py-3 px-6 text-left">Email</th>
                  <th className="py-3 px-6 text-left">First Name</th>
                  <th className="py-3 px-6 text-left">Last Name</th>
                  <th className="py-3 px-6 text-left">Remove</th>
                </tr>
              </thead>
              <tbody className="text-lg">
                {/* Map all users to an actual div */}
                {isLoading && (
                  <tr>
                    {" "}
                    <td>Loading users...</td>{" "}
                  </tr>
                )}
                {loadingError && (
                  <tr>
                    {" "}
                    <td className="text-red-500">Error: {loadingError} </td>{" "}
                  </tr>
                )}
                {!isLoading &&
                  !loadingError &&
                  users.map(user => (
                    <tr
                      key={user.username}
                      className="border-b border-gray-500 hover:bg-gray-500 transition"
                    >
                      <td className="py-3 px-6 text-left whitespace-nowrap">{user.username}</td>
                      <td className="py-3 px-6 text-left">{user.email}</td>
                      <td className="py-3 px-6 text-left">{user.first_name}</td>
                      <td className="py-3 px-6 text-left">{user.last_name}</td>
                      <td className="py-1 px-6">
                        <button
                          className="flex justify-center items-center w-full py-2 text-red-500 hover:text-red-700"
                          onClick={() => {
                            setUserIdToRemove(user.id);
                            setUserToRemove(user.username);
                            setRemovingModal(true);
                          }}
                        >
                          <Trash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
