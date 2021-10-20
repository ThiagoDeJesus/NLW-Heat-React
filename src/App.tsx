import { useEffect } from "react";
import styles from "./App.module.scss";
import { LoginBox } from "./components/LoginBox";
import { MessageList } from "./components/MessageList";
import { SendMessageForm } from "./components/SendMessageForm";
import { useAuth } from "./context/auth";

export function App() {
  const { user, userExistsOrIsLoading } = useAuth();

  return (
    <main
      className={`${styles.contentWrapper} ${
        userExistsOrIsLoading() ? styles.contentSigned : ""
      }`}
    >
      <MessageList />
      {userExistsOrIsLoading() ? <SendMessageForm /> : <LoginBox />}
    </main>
  );
}
