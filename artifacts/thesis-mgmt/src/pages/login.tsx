import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      setLocation("/dashboard");
    } catch (err) {
      toast({
        title: "Грешка при вход",
        description: "Невалиден имейл или парола.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md bg-white shadow-sm border-slate-100">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">Вход в системата</CardTitle>
          <CardDescription>
            Въведете вашите данни за достъп до TMS
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Имейл</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="име@университет.bg" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Парола</Label>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200" type="submit" disabled={loading} data-testid="button-submit-login">
              {loading ? "Зареждане..." : "Вход"}
            </Button>
            <div className="text-sm text-center text-slate-500">
              Нямате акаунт? <Link href="/register" className="text-indigo-600 font-medium hover:text-indigo-700 hover:underline" data-testid="link-register">Регистрация</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
