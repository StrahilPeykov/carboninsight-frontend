"use client";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "lucide-react";

interface AuthenticatedUser {
  company_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export default function ManageUserPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const [token, setToken] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Retrieve token.
  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    if (storedToken) {
      setToken(storedToken);
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const id = localStorage.getItem("selected_company_id");
    if (!id) {
      router.push("/list-companies");
      return;
    }
    setCompanyId(id);
  }, [router]);

  const [users, setUsers] = useState<AuthenticatedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Returns an array of authenticated users.
    const getAuthenticatedUsers = async (): Promise<AuthenticatedUser[]> => {
      if (!token) {
        return [];
      }

      try {
        const response = await fetch(`${API_URL}/companies/${companyId}/list_users/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data as AuthenticatedUser[];
      } catch (err: unknown) {
        if (err instanceof Error) {
          setLoadingError(err.message);
        } else {
          setLoadingError("Something went wrong");
        }
        return [];
      }
    };

    if (token) {
      getAuthenticatedUsers()
        .then(data => setUsers(data))
        .catch(err => setLoadingError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [API_URL, companyId, token, refreshKey]); // Rerun when either token or refreshkey updates.

  const [activeAddingModal, setAddingModal] = useState(false);
  const [userToAdd, setUserToAdd] = useState<string>("");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [addingMessage, setAddingMessage] = useState<string | null>(null);
  const [addingError, setAddingError] = useState<string | null>(null);
  const [activeRemovingModal, setRemovingModal] = useState(false);
  const [userToRemove, setUserToRemove] = useState<string>("");
  const [isRemovingUser, setIsRemovingUser] = useState(false);
  const [removalMessage, setRemovalMessage] = useState<string | null>(null);
  const [removingError, setRemovingError] = useState<string | null>(null);

  const handleAddingUser = async () => {
    if (!userToAdd) return;
    if (isAddingUser) return;

    setIsAddingUser(true);
    setRemovalMessage(null);
    setRemovingError(null);
    setAddingError(null);

    try {
      const response = await fetch(`${API_URL}/companies/${companyId}/add_user/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: userToAdd }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      await response.json(); // Should get a response if the api call was successfull.
      setAddingMessage(`Successfully added  ${userToAdd} to the company!`);
      setRefreshKey(prev => prev + 1);
      setUserToAdd("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAddingError(err.message);
      } else {
        setAddingError("Something went wrong");
      }
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleRemovingUser = async () => {
    if (!userToRemove) return;
    if (isRemovingUser) return;

    setIsRemovingUser(true);
    setAddingError(null);
    setAddingMessage(null);
    setRemovingError(null);

    try {
      const response = await fetch(`${API_URL}/companies/${companyId}/remove_user/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: userToRemove }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      setRemovalMessage(`Successfully removed ${userToRemove} from the company!`);
      setRefreshKey(prev => prev + 1);
      setUserToRemove("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setRemovingError(err.message);
      } else {
        setRemovingError("Something went wrong");
      }
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
