import { useState, useEffect } from "react";
import { AuthContext } from "./authContext";

const DEMO_PASSWORD = "Demo@123";

const INITIAL_DEMO_USERS = [
  {
    id: 1,
    name: "Demo Seller",
    email: "seller@demo.com",
    password: DEMO_PASSWORD,
    role: "seller",
  },
  {
    id: 2,
    name: "Demo Seller 2",
    email: "seller2@demo.com",
    password: DEMO_PASSWORD,
    role: "seller",
  },
  {
    id: 3,
    name: "Demo Buyer",
    email: "buyer@demo.com",
    password: DEMO_PASSWORD,
    role: "buyer",
  },
];

const INITIAL_DEMO_ORDERS = [
  {
    id: 101,
    gigId: 1,
    title: "I will build a modern responsive website using React",
    seller: "Demo Seller",
    sellerId: 1,
    buyer: "Demo Buyer",
    buyerId: 3,
    price: 2500,
    status: "Pending",
    createdAt: new Date().toISOString(),
  },
];

// Convert old role names to the new role names.
const normalizeRole = (role) => {
  if (role === "buyer") return "client";
  if (role === "seller") return "freelancer";

  return role === "freelancer" ? "freelancer" : "client";
};

// Never expose the stored password through the current-user object.
const sanitizeUser = (user) =>
  Object.fromEntries(
    Object.entries(user).filter(([key]) => key !== "password")
  );

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("currentUser");

      if (!savedUser) return null;

      const user = JSON.parse(savedUser);

      return {
        ...user,
        role: normalizeRole(user.role),
      };
    } catch (err) {
      console.error("Failed to load current user:", err);
      return null;
    }
  });

  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem("users");

      if (!savedUsers) {
        localStorage.setItem(
          "users",
          JSON.stringify(INITIAL_DEMO_USERS)
        );
      } else {
        // Upgrade existing demo accounts created before password support.
        const users = JSON.parse(savedUsers);

        const upgradedUsers = users.map((user) => {
          const demoUser = INITIAL_DEMO_USERS.find(
            (demo) =>
              demo.email.toLowerCase() === user.email?.toLowerCase()
          );

          return {
            ...user,
            role: normalizeRole(user.role),
            ...(demoUser && !user.password
              ? { password: demoUser.password }
              : {}),
          };
        });

        localStorage.setItem("users", JSON.stringify(upgradedUsers));
      }

      // Normalize the saved session without updating React state here.
      const savedCurrentUser = localStorage.getItem("currentUser");

      if (savedCurrentUser) {
      const user = JSON.parse(savedCurrentUser);
      
      localStorage.setItem(
      "currentUser",
      JSON.stringify({
      ...user,
      role: normalizeRole(user.role),
      })
      );
      }

      if (!localStorage.getItem("orders")) {
        localStorage.setItem(
          "orders",
          JSON.stringify(INITIAL_DEMO_ORDERS)
        );
      }
    } catch (err) {
      console.error("Error loading demo data:", err);
    }
  }, []);

  const updateCurrentUser = (user) => {
    if (user) {
      const normalizedUser = {
        ...user,
        role: normalizeRole(user.role),
      };

      const safeUser = sanitizeUser(normalizedUser);

      localStorage.setItem("currentUser", JSON.stringify(safeUser));
      setCurrentUser(safeUser);
    } else {
      localStorage.removeItem("currentUser");
      setCurrentUser(null);
    }
  };

  const login = (email, password) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const rawUsers = localStorage.getItem("users");

      const users = rawUsers
        ? JSON.parse(rawUsers)
        : INITIAL_DEMO_USERS;

      const matchedUser = users.find(
        (user) => user.email.toLowerCase() === normalizedEmail
      );

      if (!matchedUser || !matchedUser.password) {
        return {
          success: false,
          message:
            "Invalid email or password. If this is an older account, please register again with a different email.",
        };
      }

      if (matchedUser.password !== password) {
        return {
          success: false,
          message: "Invalid email or password.",
        };
      }

      const normalizedUser = {
        ...matchedUser,
        role: normalizeRole(matchedUser.role),
      };

      updateCurrentUser(normalizedUser);

      return {
        success: true,
        user: sanitizeUser(normalizedUser),
      };
    } catch (err) {
      console.error("Login failed:", err);

      return {
        success: false,
        message: "Unable to log in. Please try again.",
      };
    }
  };

  const quickLogin = (user) => {
    updateCurrentUser(user);
  };

  const register = ({ name, email, password, role }) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (!name.trim() || !normalizedEmail || !password) {
        return {
          success: false,
          message: "Please fill in all required fields.",
        };
      }

      const rawUsers = localStorage.getItem("users");

      const users = rawUsers
        ? JSON.parse(rawUsers)
        : INITIAL_DEMO_USERS;

      const existingUser = users.find(
        (user) => user.email.toLowerCase() === normalizedEmail
      );

      if (existingUser) {
        return {
          success: false,
          message: "An account with this email already exists. Please log in.",
        };
      }

      const newUser = {
        id: Date.now(),
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: normalizeRole(role),
      };

      localStorage.setItem(
        "users",
        JSON.stringify([...users, newUser])
      );

      updateCurrentUser(newUser);

      return {
        success: true,
        user: sanitizeUser(newUser),
      };
    } catch (err) {
      console.error("Registration failed:", err);

      return {
        success: false,
        message: "Unable to register. Please try again.",
      };
    }
  };

  const logout = () => {
    updateCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        register,
        logout,
        quickLogin,
        isLoggedIn: !!currentUser,

        isClient: currentUser?.role === "client",
        isFreelancer: currentUser?.role === "freelancer",

        // Keep these aliases temporarily if older components use them.
        isBuyer: currentUser?.role === "client",
        isSeller: currentUser?.role === "freelancer",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
