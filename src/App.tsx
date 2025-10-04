import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/clerk-react'
import './App.css'

function App() {
  return (
    <>
      <header>
        <SignedOut>
          <SignInButton />
          <SignUpButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
      <h1>Vite + React + Clerk</h1>
      <div className="card">
        <SignedIn>
          <p>Welcome! You are signed in.</p>
        </SignedIn>
        <SignedOut>
          <p>Please sign in to continue.</p>
        </SignedOut>
      </div>
    </>
  )
}

export default App
