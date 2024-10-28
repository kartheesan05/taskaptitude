"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { initializeTestQuestions } from "@/lib/actions"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function DepartmentSelection() {
  const [department, setDepartment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("") // Add error state
  const router = useRouter()

  const departments = [
    "CSE", "AIDS", "ECE", "EEE", "IT", "MECH", "CHEM", "BIOTECH", "MECHAUTO"
  ]

  const handleLogout = () => {
    document.cookie.split(";").forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })
    router.push("/login")
  }

  const handleStartTest = async () => {
    setIsLoading(true)
    setError("") // Clear any previous errors
    try {
      await initializeTestQuestions(department)
      router.push("/")
    } catch (error) {
      setError("Failed to start the test. Please try again.") // Set error message
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            MCQ Test
          </CardTitle>
          <CardDescription className="text-center">
            Select your department to begin the test
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && ( // Add error message display
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <div className="space-y-2">
            <label
              htmlFor="department"
              className="text-sm font-medium text-gray-700">
              Department
            </label>
            <Select onValueChange={setDepartment}>
              <SelectTrigger id="department" className="w-full">
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            className="w-full bg-blue-800 hover:bg-blue-900 text-white"
            disabled={!department || isLoading}
            onClick={handleStartTest}>
            {isLoading ? "Loading..." : "Start Test"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full text-gray-600 hover:text-gray-900">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
