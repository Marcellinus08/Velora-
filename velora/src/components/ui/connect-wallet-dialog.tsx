"use client";

import { useState } from "react";
import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { useAccount } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConnectWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AbstractLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="18"
      viewBox="0 0 52 47"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="currentColor"
        d="M33.7221 31.0658L43.997 41.3463L39.1759 46.17L28.901 35.8895C28.0201 35.0081 26.8589 34.5273 25.6095 34.5273C24.3602 34.5273 23.199 35.0081 22.3181 35.8895L12.0432 46.17L7.22205 41.3463L17.4969 31.0658H33.7141H33.7221Z"
      />
      <path
        fill="currentColor"
        d="M35.4359 28.101L49.4668 31.8591L51.2287 25.2645L37.1978 21.5065C35.9965 21.186 34.9954 20.4167 34.3708 19.335C33.7461 18.2613 33.586 17.0033 33.9063 15.8013L37.6623 1.76283L31.0713 0L27.3153 14.0385L35.4279 28.093L35.4359 28.101Z"
      />
      <path
        fill="currentColor"
        d="M15.7912 28.101L1.76028 31.8591L-0.00158691 25.2645L14.0293 21.5065C15.2306 21.186 16.2316 20.4167 16.8563 19.335C17.4809 18.2613 17.6411 17.0033 17.3208 15.8013L13.5648 1.76283L20.1558 0L23.9118 14.0385L15.7992 28.093L15.7912 28.101Z"
      />
    </svg>
  );
}

export function ConnectWalletDialog({ open, onOpenChange }: ConnectWalletDialogProps) {
  const { login } = useLoginWithAbstract();
  const { isConnected } = useAccount();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsConnecting(true);
      await login();
      // Close dialog setelah berhasil connect
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Auto close jika sudah connected
  if (isConnected && open) {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-neutral-900 border-neutral-800">
        <DialogHeader className="text-center space-y-4">
          <DialogTitle className="text-xl text-neutral-100">
            Connect your wallet to get started
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            Sign in to make purchases and access all features
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex flex-col items-center gap-4">
          <Button
            onClick={handleSignIn}
            disabled={isConnecting}
            className="w-full h-11 bg-white hover:bg-neutral-200 text-neutral-900 font-semibold rounded-full flex items-center justify-center gap-2 transition-all"
          >
            <span>{isConnecting ? "Connecting..." : "Sign In"}</span>
            <AbstractLogo className="h-4 w-4" />
          </Button>

          <p className="text-xs text-neutral-500 text-center">
            By connecting, you agree to our Terms of Service
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
