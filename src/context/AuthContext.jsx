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
      const existingUsers = localStorage.getItem("users");

      if (!existingUsers) {
        localStorage.setItem(
          "users",
          JSON.stringify(INITIAL_DEMO_USERS)
        );
      }

      const existingOrders = localStorage.getItem("orders");

      if (!existingOrders) {
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
    const rawUsers = localStorage.getItem("users");
    const users = rawUsers
      ? JSON.parse(rawUsers)
      : INITIAL_DEMO_USERS;

    const matchedUser = users.find(
      (user) =>
        user.email.toLowerCase() ===
        email.trim().toLowerCase()
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
      role: "buyer",
    };

    const updatedUsers = [...users, fallbackUser];

    localStorage.setItem(
      "users",
      JSON.stringify(updatedUsers)
    );

    updateCurrentUser(fallbackUser);

    return {
      success: true,
      user: fallbackUser,
    };
  };

  const quickLogin = (user) => {
    updateCurrentUser(user);
  };

  const register = ({ name, email, password, role }) => {
    const rawUsers = localStorage.getItem("users");
    const users = rawUsers
      ? JSON.parse(rawUsers)
      : INITIAL_DEMO_USERS;

    const existingUser = users.find(
      (user) =>
        user.email.toLowerCase() ===
        email.trim().toLowerCase()
    );

    if (existingUser) {
      updateCurrentUser(existingUser);

      return {
        success: true,
        user: existingUser,
      };
    }

    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      role: role || "buyer",
    };

    const updatedUsers = [...users, newUser];

    localStorage.setItem(
      "users",
      JSON.stringify(updatedUsers)
    );

    updateCurrentUser(newUser);

    return {
      success: true,
      user: newUser,
    };
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
        isBuyer: currentUser?.role === "buyer",
        isSeller: currentUser?.role === "seller",
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

