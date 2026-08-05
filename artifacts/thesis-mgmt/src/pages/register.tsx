import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { type RegisterInputRole } from "@workspace/api-client-react";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<RegisterInputRole>("student");
  const [facultyNumber, setFacultyNumber] = useState("");
  
  const { register } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const needsFacultyNumber = role === "student" || role === "supervisor";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ email, password, firstName, lastName, role, facultyNumber: facultyNumber || undefined } as any);
      setLocation("/dashboard");
    } catch (err) {
      toast({
        title: "Грешка при регистрация",
        description: err instanceof Error ? err.message : "Моля, проверете въведените данни.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 py-12">
      <Card className="w-full max-w-lg bg-white shadow-sm border-slate-100">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">Регистрация</CardTitle>
          <CardDescription>
            Създайте нов профил в Системата за управление на дипломни работи
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Име</Label>
                <Input 
                  id="firstName" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  data-testid="input-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input 
                  id="lastName" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  data-testid="input-last-name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Имейл</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Парола</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                  data-testid="input-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Роля</Label>
              <Select value={role} onValueChange={(val) => setRole(val as RegisterInputRole)}>
                <SelectTrigger id="role" data-testid="select-role">
                  <SelectValue placeholder="Изберете роля" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Студент</SelectItem>
                  <SelectItem value="supervisor">Научен ръководител</SelectItem>
                  <SelectItem value="reviewer">Рецензент</SelectItem>
                  <SelectItem value="department_head">Ръководител катедра</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {needsFacultyNumber && (
              <div className="space-y-2">
                <Label htmlFor="facultyNumber">
                  Факултетен номер <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="facultyNumber"
                  value={facultyNumber}
                  onChange={(e) => setFacultyNumber(e.target.value)}
                  placeholder={role === "student" ? "121222XXX" : "001212XXX"}
                  required
                  data-testid="input-faculty-number"
                />
                <p className="text-xs text-slate-400">
                  {role === "student"
                    ? "Студентският номер започва с 121222"
                    : "Служебният номер започва с 001212"}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200" type="submit" disabled={loading} data-testid="button-submit-register">
              {loading ? "Зареждане..." : "Регистрация"}
            </Button>
            <div className="text-sm text-center text-slate-500">
              Вече имате акаунт? <Link href="/login" className="text-indigo-600 font-medium hover:text-indigo-700 hover:underline" data-testid="link-login">Вход</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
