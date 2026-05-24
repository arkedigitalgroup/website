// app/register/page.js

import { Suspense } from "react";
import RegisterPage from "./RegisterPage"; // move your current component here

// ✅ This is the actual page file — thin wrapper only
export default function Page() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-white animate-pulse">አርኬ እየጫነ ነው...</p>
                </div>
            }
        >
            <RegisterPage />
        </Suspense>
    );
}
