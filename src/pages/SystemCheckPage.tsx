import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Database,
  Lock,
  HardDrive,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface TestResult {
  name: string;
  status: "pending" | "success" | "failure";
  message: string;
  details?: Record<string, any>;
}

export default function SystemCheckPage() {
  const { userRole, isAuthenticated } = useAuth();
  const [results, setResults] = useState<TestResult[]>([
    { name: "Authentication Status", status: "pending", message: "" },
    { name: "Role Verification (RBAC)", status: "pending", message: "" },
    { name: "Database Read Test", status: "pending", message: "" },
    { name: "Database Write Test", status: "pending", message: "" },
    { name: "Storage Bucket Check", status: "pending", message: "" },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const updateResult = (
    index: number,
    status: "success" | "failure",
    message: string,
    details?: Record<string, any>,
  ) => {
    setResults((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status, message, details };
      return updated;
    });
  };

  const runTests = async () => {
    setIsRunning(true);
    setLogs([]);

    // Reset all results to pending
    setResults((prev) =>
      prev.map((r) => ({
        ...r,
        status: "pending",
        message: "",
        details: undefined,
      })),
    );

    addLog("Starting system check...");

    // Test 1: Authentication Status Check
    try {
      addLog("Running Authentication Status Check...");
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;

      if (session && session.user) {
        const userId = session.user.id;
        const email = session.user.email || "N/A";
        const tokenPrefix = session.access_token?.substring(0, 10) || "N/A";
        const message = `Logged In as ${email} (ID: ${userId})`;

        updateResult(0, "success", message, {
          userId,
          email,
          tokenPrefix: tokenPrefix + "...",
          authState: "Authenticated",
        });
        addLog(`✓ Auth Status: ${message}`);
      } else {
        updateResult(0, "success", "Guest User (Not Authenticated)", {
          userId: "N/A",
          email: "N/A",
          authState: "Guest",
        });
        addLog("✓ Auth Status: Guest Mode");
      }
    } catch (error: any) {
      updateResult(0, "failure", `Auth Error: ${error.message}`);
      addLog(`✗ Auth Error: ${error.message}`);
    }

    // Test 2: Role Verification (RBAC)
    try {
      addLog("Running Role Verification...");
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        updateResult(1, "success", "Guest - No role assigned", {
          dbRole: "N/A",
          contextRole: userRole || "N/A",
          match: false,
        });
        addLog("✓ Role Check: Guest mode");
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          updateResult(
            1,
            "success",
            "No role record in DB (might be first login)",
            {
              dbRole: null,
              contextRole: userRole || "pending",
            },
          );
          addLog("✓ Role Check: No role record (expected for new users)");
        } else {
          throw error;
        }
      } else {
        const dbRole = data?.role;
        const match = dbRole === userRole;
        const message = match
          ? `Role matches: ${dbRole}`
          : `Mismatch - DB: ${dbRole}, Context: ${userRole}`;

        updateResult(1, match ? "success" : "failure", message, {
          dbRole,
          contextRole: userRole,
          match,
        });
        addLog(`✓ Role Check: ${message}`);
      }
    } catch (error: any) {
      updateResult(1, "failure", `Role Error: ${error.message}`);
      addLog(`✗ Role Error: ${error.message}`);
    }

    // Test 3: Database Read Test
    try {
      addLog("Running Database Read Test...");
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        updateResult(2, "success", "Skipped (Guest user)", {
          reason: "Cannot read profiles as guest",
        });
        addLog("⊙ Read Test: Skipped (guest)");
      } else {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            updateResult(2, "success", "Profile not created yet", {
              reason: "User may not have completed signup",
            });
            addLog("⊙ Read Test: No profile record");
          } else {
            throw error;
          }
        } else {
          updateResult(
            2,
            "success",
            `Profile loaded: ${data.full_name || "Unnamed"}`,
            {
              profileId: data.id,
              fullName: data.full_name,
              email: data.user_id,
            },
          );
          addLog(`✓ Read Test: Profile loaded successfully`);
        }
      }
    } catch (error: any) {
      updateResult(2, "failure", `Read Error: ${error.message}`);
      addLog(`✗ Read Error: ${error.message}`);
    }

    // Test 4: Database Write Test
    try {
      addLog("Running Database Write Test...");
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        updateResult(3, "success", "Skipped (Guest user)", {
          reason: "Cannot write as guest",
        });
        addLog("⊙ Write Test: Skipped (guest)");
      } else {
        // Try to update a profile (even if it doesn't exist, we'll try to insert)
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ updated_at: new Date().toISOString() })
          .eq("user_id", session.user.id);

        if (updateError) {
          // If update fails, it might be because the record doesn't exist
          if (updateError.code === "PGRST116") {
            updateResult(
              3,
              "success",
              "No profile to update (expected for new users)",
              {
                reason: "Profile might not exist yet",
              },
            );
            addLog("⊙ Write Test: No profile to update");
          } else {
            throw updateError;
          }
        } else {
          updateResult(
            3,
            "success",
            "Write Permission Granted - Profile updated",
            {
              action: "Updated updated_at timestamp",
            },
          );
          toast.success("Write Permission Granted");
          addLog(`✓ Write Test: Profile updated successfully`);
        }
      }
    } catch (error: any) {
      if (error.message?.includes("RLS violation")) {
        updateResult(
          3,
          "failure",
          "RLS Violation - Row Level Security is blocking writes",
          {
            error: error.message,
          },
        );
        addLog(`✗ Write Test: RLS Violation detected`);
      } else {
        updateResult(3, "failure", `Write Error: ${error.message}`);
        addLog(`✗ Write Error: ${error.message}`);
      }
    }

    // Test 5: Storage Bucket Check
    try {
      addLog("Running Storage Bucket Check...");
      const { data, error } = await supabase.storage
        .from("medical-records")
        .list("", { limit: 1 });

      if (error) {
        throw error;
      }

      updateResult(
        4,
        "success",
        `Bucket Accessible - ${data?.length || 0} file(s) found`,
        {
          bucket: "medical-records",
          accessible: true,
          fileCount: data?.length || 0,
        },
      );
      addLog(`✓ Storage Check: Bucket is accessible`);
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        updateResult(4, "failure", 'Bucket "medical-records" not found', {
          error: error.message,
        });
      } else {
        updateResult(4, "failure", `Storage Error: ${error.message}`);
      }
      addLog(`✗ Storage Error: ${error.message}`);
    }

    addLog("System check completed!");
    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "failure":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-warning animate-pulse" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-success/15 text-success border-success/30">
            Pass
          </Badge>
        );
      case "failure":
        return (
          <Badge className="bg-destructive/15 text-destructive border-destructive/30">
            Fail
          </Badge>
        );
      default:
        return (
          <Badge className="bg-warning/15 text-warning border-warning/30">
            Running
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Supabase System Check</h1>
          <p className="text-muted-foreground">
            Real-time diagnostics and connectivity verification
          </p>
        </motion.div>

        {/* System Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Current Session
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Auth Status</p>
                <p className="font-semibold">
                  {isAuthenticated ? "Logged In" : "Guest"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">User Role</p>
                <p className="font-semibold">{userRole || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Environment</p>
                <p className="font-semibold text-xs font-mono">
                  Browser (React)
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Run Tests Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8 flex gap-3"
        >
          <Button
            onClick={runTests}
            disabled={isRunning}
            variant="hero"
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRunning ? "animate-spin" : ""}`}
            />
            {isRunning ? "Running Tests..." : "Run Tests Again"}
          </Button>
          <Button variant="outline" asChild>
            <a href="/">← Back to Home</a>
          </Button>
        </motion.div>

        {/* Test Results Grid */}
        <div className="grid gap-4 mb-8">
          {results.map((result, index) => (
            <motion.div
              key={result.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <Card
                className={`overflow-hidden border-l-4 ${
                  result.status === "success"
                    ? "border-l-success bg-success/5"
                    : result.status === "failure"
                      ? "border-l-destructive bg-destructive/5"
                      : "border-l-warning bg-warning/5"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <CardTitle className="text-lg">{result.name}</CardTitle>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">{result.message}</p>
                  {result.details && (
                    <div className="bg-secondary/50 p-3 rounded-lg text-xs font-mono">
                      <pre>{JSON.stringify(result.details, null, 2)}</pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Console Log Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-950 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-200">
                <Database className="h-5 w-5" />
                Console Output
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 p-4 rounded-lg font-mono text-xs text-slate-300 h-64 overflow-y-auto border border-slate-800">
                {logs.length === 0 ? (
                  <p className="text-slate-500">
                    No logs yet. Run tests to see output.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {logs.map((log, i) => (
                      <div key={i} className="text-slate-400">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 p-4 bg-secondary/30 rounded-lg text-sm text-muted-foreground text-center">
          <p>
            This page is for internal diagnostics only. Do not expose in
            production.
          </p>
        </div>
      </div>
    </div>
  );
}
