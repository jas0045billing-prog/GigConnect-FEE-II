
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const INITIAL_DEMO_USERS = [
  {
    id: 1,
    name: "Demo Seller",
    email: "seller@demo.com",
    role: "seller",
  },
  {
    id: 2,
    name: "Demo Seller 2",
    email: "seller2@demo.com",
    role: "seller",
  },
  {
    id: 3,
    name: "Demo Buyer",
    email: "buyer@demo.com",
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

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("currentUser");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (err) {
      console.error("Failed to load current user:", err);
      return null;
    }
  });

  useEffect(() => {
    try {
      if (!localStorage.getItem("users")) {
        localStorage.setItem(
          "users",
          JSON.stringify(INITIAL_DEMO_USERS)
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
      localStorage.setItem("currentUser", JSON.stringify(user));
      setCurrentUser(user);
    } else {
      localStorage.removeItem("currentUser");
      setCurrentUser(null);
    }
  };

  const login = (email, password) => {
    try {
      const rawUsers = localStorage.getItem("users");
      const users = rawUsers
        ? JSON.parse(rawUsers)
        : INITIAL_DEMO_USERS;

      const matchedUser = users.find(
        (user) =>
          user.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (matchedUser) {
        updateCurrentUser(matchedUser);

        return {
          success: true,
          user: matchedUser,
        };
      }

      const fallbackUser = {
        id: Date.now(),
        name: email.split("@")[0] || "User",
        email: email.trim(),
        role: "client",
      };

      localStorage.setItem(
        "users",
        JSON.stringify([...users, fallbackUser])
      );

      updateCurrentUser(fallbackUser);

      return {
        success: true,
        user: fallbackUser,
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
      const rawUsers = localStorage.getItem("users");
      const users = rawUsers
        ? JSON.parse(rawUsers)
        : INITIAL_DEMO_USERS;

      const normalizedEmail = email.trim().toLowerCase();

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
        email: email.trim(),
        role: role === "freelancer" || role === "seller"
          ? role
          : "client",
      };

      localStorage.setItem(
        "users",
        JSON.stringify([...users, newUser])
      );

      updateCurrentUser(newUser);

      return {
        success: true,
        user: newUser,
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

        // Support both old and new role names
        isClient:
          currentUser?.role === "client" ||
          currentUser?.role === "buyer",

        isFreelancer:
          currentUser?.role === "freelancer" ||
          currentUser?.role === "seller",

        isBuyer:
          currentUser?.role === "buyer" ||
          currentUser?.role === "client",

        isSeller:
          currentUser?.role === "seller" ||
          currentUser?.role === "freelancer",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}