import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import ThesesList from "@/pages/theses/index";
import NewThesis from "@/pages/theses/new";
import ThesisDetail from "@/pages/theses/detail";
import DefensesList from "@/pages/defenses/index";
import NewDefense from "@/pages/defenses/new";
import DefenseDetail from "@/pages/defenses/detail";
import Reviews from "@/pages/reviews";
import Users from "@/pages/users";
import Profile from "@/pages/profile";
import Notifications from "@/pages/notifications";
import Reports from "@/pages/reports";
import AuditLog from "@/pages/audit-log";
import Supervisors from "@/pages/supervisors";
import SupervisorRequests from "@/pages/supervisor-requests";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function ProtectedRoute({ component: Component, roles }: { component: React.ComponentType; roles?: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Зареждане...</div>;
  if (!user) return <Redirect to="/login" />;
  if (roles && !roles.includes(user.role)) return <Redirect to="/dashboard" />;

  return <Component />;
}

function withLayout(Component: React.ComponentType, roles?: string[]) {
  return () => (
    <Layout>
      <ProtectedRoute component={Component} roles={roles} />
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>

      <Route path="/dashboard" component={withLayout(Dashboard)} />
      <Route path="/theses/new" component={withLayout(NewThesis, ["student"])} />
      <Route path="/theses/:id" component={withLayout(ThesisDetail)} />
      <Route path="/theses" component={withLayout(ThesesList)} />
      <Route path="/defenses/new" component={withLayout(NewDefense, ["admin", "committee_member"])} />
      <Route path="/defenses/:id" component={withLayout(DefenseDetail)} />
      <Route path="/defenses" component={withLayout(DefensesList)} />
      <Route path="/reviews" component={withLayout(Reviews, ["reviewer", "admin"])} />
      <Route path="/users" component={withLayout(Users, ["admin"])} />
      <Route path="/profile" component={withLayout(Profile)} />
      <Route path="/notifications" component={withLayout(Notifications)} />
      <Route path="/reports" component={withLayout(Reports, ["admin", "supervisor"])} />
      <Route path="/audit-log" component={withLayout(AuditLog, ["admin"])} />
      <Route path="/supervisors" component={withLayout(Supervisors)} />
      <Route path="/supervisor-requests" component={withLayout(SupervisorRequests, ["supervisor", "admin"])} />

      <Route>
        <Layout>
          <NotFound />
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
