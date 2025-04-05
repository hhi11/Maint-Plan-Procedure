
import { Route, Switch, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/layout";
import Home from "@/pages/home";
import JobPlans from "@/pages/job-plans";
import Login from "@/pages/login";
import FAQ from "@/pages/faq";
import Contact from "@/pages/contact";

const queryClient = new QueryClient();

function AuthenticatedRoute({ component: Component, ...rest }: any) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Redirect to="/login" />;
  }
  return <Component {...rest} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/login" component={Login} />
        <Route>
          <Layout>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/job-plans" component={() => <AuthenticatedRoute component={JobPlans} />} />
              <Route path="/faq" component={FAQ} />
              <Route path="/contact" component={Contact} />
              <Redirect to="/" />
            </Switch>
          </Layout>
        </Route>
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}
