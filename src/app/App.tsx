import { useState, useEffect } from "react";
import { Book, Page, User, getUser, removeUser } from "./components/storage";
import { ThemeProvider } from "./components/ThemeContext";
import { HomePage } from "./components/HomePage";
import { AuthPage } from "./components/AuthPage";
import { BooksPage } from "./components/BooksPage";
import { PagesPage } from "./components/PagesPage";
import { EditorPage } from "./components/EditorPage";
import { SearchModal } from "./components/SearchModal";

type View = "home" | "signin" | "signup" | "books" | "pages" | "editor";

function AppContent() {
  const [view, setView] = useState<View>("home");
  const [user, setUser] = useState<User | null>(getUser);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Ctrl+K global search shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k" && view !== "home" && view !== "signin" && view !== "signup") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [view]);

  const goToBooks = () => setView("books");

  // "Make Notes" always goes to Sign Up if not logged in
  const handleMakeNotes = () => {
    if (user) {
      setView("books");
    } else {
      setView("signup");
    }
  };

  const handleAuthSuccess = () => {
    setUser(getUser());
    setView("books");
  };

  const handleSignOut = () => {
    removeUser();
    setUser(null);
    setView("home");
  };

  const handleOpenBook = (book: Book) => {
    setSelectedBook(book);
    setView("pages");
  };

  const handleOpenPage = (page: Page) => {
    setSelectedPage(page);
    setView("editor");
  };

  const handleBackToBooks = () => {
    setSelectedBook(null);
    setSelectedPage(null);
    setView("books");
  };

  const handleBackToPages = () => {
    setSelectedPage(null);
    setView("pages");
  };

  const handleSearchNavigate = (book: Book, page: Page) => {
    setSearchOpen(false);
    setSelectedBook(book);
    setSelectedPage(page);
    setView("editor");
  };

  const isDarkable = view !== "home" && view !== "signin" && view !== "signup";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {searchOpen && isDarkable && (
        <SearchModal
          isDark={false}
          onNavigate={handleSearchNavigate}
          onClose={() => setSearchOpen(false)}
        />
      )}

      {view === "home" && (
        <HomePage
          onMakeNotes={handleMakeNotes}
          onSignIn={() => setView("signin")}
          onSignUp={() => setView("signup")}
        />
      )}

      {view === "signin" && (
        <AuthPage
          initialMode="signin"
          onSuccess={handleAuthSuccess}
          onBack={() => setView("home")}
          onSwitchMode={(m) => setView(m)}
        />
      )}

      {view === "signup" && (
        <AuthPage
          initialMode="signup"
          onSuccess={handleAuthSuccess}
          onBack={() => setView("home")}
          onSwitchMode={(m) => setView(m)}
        />
      )}

      {view === "books" && (
        <BooksPage
          user={user}
          onOpenBook={handleOpenBook}
          onSignOut={handleSignOut}
          onOpenSearch={() => setSearchOpen(true)}
        />
      )}

      {view === "pages" && selectedBook && (
        <PagesPage
          book={selectedBook}
          onBack={handleBackToBooks}
          onOpenPage={handleOpenPage}
          onOpenSearch={() => setSearchOpen(true)}
        />
      )}

      {view === "editor" && selectedBook && selectedPage && (
        <EditorPage
          book={selectedBook}
          page={selectedPage}
          onBack={handleBackToPages}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
