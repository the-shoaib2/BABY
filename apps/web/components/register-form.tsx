"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, RefreshCw, Utensils, Code2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "next-auth/react"
import { toast } from "react-hot-toast"

// Form validation types
type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  captcha?: string;
};

export default function RegisterForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [captchaText, setCaptchaText] = useState("");
  const [captchaSessionId, setCaptchaSessionId] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [isLoadingCaptcha, setIsLoadingCaptcha] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Set isMounted to true after initial render
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const { name, email, password, confirmPassword } = formData
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Optimistically update form data
    setFormData(prev => {
      // Only update if value actually changed
      if (prev[name as keyof typeof prev] === value) return prev;
      return { ...prev, [name]: value };
    });
    
    // Clear any existing error for this field if it exists
    setErrors(prev => {
      if (!prev[name as keyof FormErrors]) return prev;
      const newErrors = { ...prev };
      delete newErrors[name as keyof FormErrors];
      return newErrors;
    });
    
    // Clear confirm password error specifically when relevant
    if (name === 'confirmPassword' && errors.confirmPassword === 'Passwords do not match') {
      setErrors(prev => ({
        ...prev,
        confirmPassword: undefined
      }));
    }
  }, [errors]);

  const fetchCaptcha = async () => {
    try {
      setIsLoadingCaptcha(true);
      setError('');
      
      const response = await fetch('/api/captcha');
      
      if (!response.ok) {
        throw new Error('Failed to load CAPTCHA');
      }
      
      const svgText = await response.text();
      const captchaId = response.headers.get('X-Captcha-ID');
      const captchaText = response.headers.get('X-Captcha-Text');
      const url = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml' }));
      
      setCaptchaImage(url);
      if (captchaId && captchaText) {
        setCaptchaSessionId(captchaId);
        // Store the CAPTCHA text in sessionStorage for validation
        sessionStorage.setItem(`captcha_${captchaId}`, captchaText);
      }
      
      return true;
    } catch (error) {
      console.error('Error fetching CAPTCHA:', error);
      setError('Failed to load CAPTCHA. Please try again.');
      toast.error('Failed to load CAPTCHA. Please try again.');
      return false;
    } finally {
      setIsLoadingCaptcha(false);
    }
  }

  const handleCaptchaSubmit = async () => {
    // Validate CAPTCHA text
    if (!captchaText.trim()) {
      setErrors(prev => ({ ...prev, captcha: 'Please enter the CAPTCHA text' }));
      return false;
    }

    setIsLoading(true);
    const toastId = toast.loading('Creating account...');

    try {
      // Get the stored CAPTCHA text
      const storedCaptchaText = sessionStorage.getItem(`captcha_${captchaSessionId}`);
      
      if (!storedCaptchaText) {
        toast.error('CAPTCHA session expired. Please refresh and try again.');
        return false;
      }
      
      const requestBody = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        captchaSessionId,
        captchaText: captchaText.trim(),
        storedCaptchaText: storedCaptchaText,
      };
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle field-specific errors from the server
        if (data.details) {
          const fieldErrors = data.details as Record<string, { _errors: string[] }>;
          const newErrors: FormErrors = {};
          
          // Map server errors to form fields
          for (const [field, errorObj] of Object.entries(fieldErrors)) {
            if (field !== '_errors' && errorObj?._errors?.length > 0) {
              const fieldName = field as keyof FormErrors;
              newErrors[fieldName] = errorObj._errors[0];
            }
          }
          
          setErrors(newErrors);
          
          // If there's a CAPTCHA error, refresh it
          if (newErrors.captcha) {
            await fetchCaptcha();
          }
          
          // Show the first error as a toast
          const firstError = Object.values(newErrors)[0];
          if (firstError) {
            toast.error(firstError, { id: toastId });
          }
        } else {
          // Generic error message if no field-specific errors
          toast.error(data.message || 'Registration failed. Please try again.', { id: toastId });
        }
        
        // If there's a CAPTCHA error, stay on the current step
        if (data.message?.toLowerCase().includes('captcha')) {
          return false;
        }
        
        // If there are validation errors, go back to the relevant step
        if (data.details) {
          if (data.details.email || data.details.name) {
            setCurrentStep(1);
          } else if (data.details.password || data.details.confirmPassword) {
            setCurrentStep(2);
          }
        }
        
        return false;
      }

      // Registration successful
      toast.success('Account created successfully!', { id: toastId });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 1500);
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      
      // Don't show network errors as toasts to avoid duplicate messages
      if (!(error instanceof Error && error.message.includes('Failed to fetch'))) {
        const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
        toast.error(errorMessage, { id: toastId });
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  const nextStep = async () => {
    try {
      // Validate current step before proceeding
      const isValid = validateStep(currentStep);
      
      // If not valid, don't proceed to next step
      if (!isValid) {
        return;
      }
      
      // If moving to step 3 (CAPTCHA), fetch the CAPTCHA
      if (currentStep === 2) {
        setIsLoadingCaptcha(true);
        try {
          const success = await fetchCaptcha();
          if (!success) {
            toast.error('Failed to load CAPTCHA. Please try again.');
            return;
          }
        } catch (error) {
          console.error('Error in nextStep:', error);
          toast.error('An error occurred. Please try again.');
          return;
        } finally {
          setIsLoadingCaptcha(false);
        }
      }
      
      // Move to next step if all validations pass
      setCurrentStep(prev => {
        const nextStep = Math.min(prev + 1, 3);
        // Clear errors when moving to next step
        if (nextStep > prev) {
          setErrors({});
        }
        return nextStep;
      });
      
    } catch (error) {
      console.error('Error in form navigation:', error);
      toast.error('An error occurred. Please try again.');
    }
  };
  
  const prevStep = () => {
    // Clear errors when going back
    setErrors({});
    // When going back from step 3 to step 2, clear CAPTCHA state
    if (currentStep === 3) {
      setCaptchaText('');
      setCaptchaImage('');
      setCaptchaSessionId('');
    }
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const StepIndicator = useMemo(() => {
    // Check if current step has errors
    const hasStepError = (step: number) => {
      if (step === 1 && (errors.name || errors.email)) return true;
      if (step === 2 && (errors.password || errors.confirmPassword)) return true;
      if (step === 3 && errors.captcha) return true;
      return false;
    };

    // Check if step is completed (valid and we've moved past it)
    const isStepCompleted = (step: number) => {
      if (step < currentStep) return true;
      return false;
    };

    return (
      <div className="mb-6 flex w-full max-w-md justify-center space-x-2">
        {[1, 2, 3].map((step) => {
          const hasError = hasStepError(step);
          const isCompleted = isStepCompleted(step);
          const isCurrent = step === currentStep;
          
          let bgColor = 'bg-gray-200 dark:bg-gray-700'; // Default/upcoming step
          
          if (hasError) {
            bgColor = 'bg-destructive';
          } else if (isCompleted) {
            bgColor = 'bg-green-500';
          } else if (isCurrent) {
            bgColor = 'bg-primary';
          }
          
          return (
            <div
              key={step}
              className={`h-2 w-8 rounded-full transition-all ${bgColor}`}
            />
          );
        })}
      </div>
    );
  }, [currentStep, errors]);

  // Helper to check if a field has an error
  const hasError = (field: keyof FormErrors) => {
    return errors[field] ? 'border-destructive' : '';
  };
  
  // Check if the current step is valid
  const isStepValid = useCallback((step: number): boolean => {
    if (step === 1) {
      const nameValid = formData.name.trim().length >= 2;
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
      return nameValid && emailValid;
    } else if (step === 2) {
      const passwordValid = formData.password.length >= 6 && 
                           /[A-Z]/.test(formData.password) && 
                           /\d/.test(formData.password);
      const passwordsMatch = formData.password === formData.confirmPassword;
      return passwordValid && passwordsMatch;
    } else if (step === 3) {
      return captchaText.trim().length > 0;
    }
    return false;
  }, [formData, captchaText]);
  
  // Validate current step and set errors
  const validateStep = useCallback((step: number): boolean => {
    const newErrors: FormErrors = {};
    
    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    } 
    else if (step === 2) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one uppercase letter';
      } else if (!/\d/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one number';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    else if (step === 3) {
      if (!captchaText.trim()) {
        newErrors.captcha = 'Please enter the CAPTCHA text';
      } else if (captchaText.trim().length < 4) {
        newErrors.captcha = 'CAPTCHA text is too short';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, captchaText]);

  // Memoize button text to prevent unnecessary re-renders
  const buttonText = useMemo(() => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {currentStep === 3 ? 'Creating Account...' : 'Loading...'}
        </>
      );
    }
    
    const texts = {
      1: 'Continue to Password',
      2: 'Continue to Verification',
      3: 'Create Account'
    };
    
    return texts[currentStep as keyof typeof texts] || 'Continue';
  }, [currentStep, isLoading]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-8 dark:bg-gray-900">
      <div className="mb-2">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Code2 className="h-6 w-6" />
          <span className="text-xl">B.A.B.Y.</span>
        </Link>
      </div>
     
    <Card className="w-full max-w-[400px] overflow-hidden shadow-lg">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl font-bold text-center">
          Sign Up
          {/* {currentStep === 1 && 'Your Information'}
          {currentStep === 2 && 'Create Password'}
          {currentStep === 3 && 'Verify You\'re Human'} */}
        </CardTitle>
        <CardDescription className="text-center text-xs">
          {currentStep === 1 && 'Enter your name and email address'}
          {currentStep === 2 && 'Create a secure password'}
          {currentStep === 3 && 'Complete the CAPTCHA to continue'}
        </CardDescription>

        <div className="py-4">
          <Button
            variant="outline"
            className="w-full"
            disabled={isGoogleLoading}
            onClick={async () => {
              try {
                setIsGoogleLoading(true)
                const result = await signIn("google", { 
                  redirect: false,
                  callbackUrl: '/dashboard'
                })
                
                if (result?.error) {
                  throw new Error(result.error)
                }
                
                // If we get here, the OAuth flow should handle the redirect
                // No need to do anything else here
              } catch (error) {
                console.error("Google sign in error:", error)
                toast.error(error instanceof Error ? error.message : "Failed to sign in with Google")
              } finally {
                setIsGoogleLoading(false)
              }
            }}
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Google</span>
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Continue with Google
              </>
            )}
          </Button>
        </div>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative min-h-[10rem]">
          {/* Step 1: Name and Email */}
          <div 
            className={`absolute left-0 right-0 transition-all duration-300 ease-in-out ${currentStep === 1 ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}
            
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="space-y-1">
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={handleInputChange}
                    className={hasError('name')}
                    required
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="space-y-1">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleInputChange}
                    className={hasError('email')}
                    required
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Password */}
          <div 
            className={`absolute left-0 right-0 transition-all duration-300 ease-in-out ${currentStep === 2 ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}
            
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <div className="space-y-1">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={password}
                      onChange={handleInputChange}
                      className={`pr-10 ${hasError('password')}`}
                      required
                    />
                    {errors.password && (
                      <p className="text-xs text-destructive">{errors.password}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <div className="space-y-1">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={handleInputChange}
                      className={`pr-10 ${hasError('confirmPassword')}`}
                      required
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: CAPTCHA */}
          <div 
            className={`absolute left-0 right-0 transition-all duration-300 ease-in-out ${currentStep === 3 ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}
            
          >
            <div className="space-y-4">
              {isLoadingCaptcha ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="captcha">Enter the text shown below:</Label>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={fetchCaptcha}
                      disabled={isLoadingCaptcha}
                      className="h-8 w-8 p-0 bg-muted/30 rounded-lg"
                      title="Refresh CAPTCHA"
                    >
                      <RefreshCw className={`h-4 w-4 rounded-full bg-muted/30 ${isLoadingCaptcha ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                  <div className="relative mt-2 flex justify-center items-center p-4 border-none h-16">
                    <div className="h-full w-full flex items-center justify-center">
                      {captchaImage ? (
                        <img 
                          src={captchaImage} 
                          alt="CAPTCHA" 
                        className="h-16 object-contain rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTUwIDUwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNmOGY5ZmEiLz48dGV4dCB4PSI3NSIgeT0iMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2NiI+RmFpbGVkIHRvIGxvYWQgQ0FQVENIQTwvdGV4dD48L3N2Zz4=';
                            setError('Failed to load CAPTCHA. Please try again.');
                          }}
                        />
                      ) : (
                        <div className="text-muted-foreground">
                          Loading CAPTCHA...
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1 mt-4">
                    <Input
                      id="captcha"
                      placeholder="Type the text above"
                      value={captchaText}
                      onChange={(e) => {
                        setCaptchaText(e.target.value);
                        if (errors.captcha) {
                          setErrors(prev => ({ ...prev, captcha: undefined }));
                        }
                      }}
                      className={`w-full text-center font-mono tracking-widest ${errors.captcha ? 'border-destructive' : ''}`}
                      autoComplete="off"
                      autoFocus
                    />
                    {errors.captcha && (
                      <p className="text-xs text-destructive text-center">{errors.captcha}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6">
        {StepIndicator}
        </div>
        <div className="mt-6 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1 || isLoading}
            className={currentStep === 1 ? 'invisible' : ''}
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              
              try {
                if (currentStep < 3) {
                  await nextStep();
                } else {
                  // For the final step, validate and submit
                  const isValid = validateStep(3);
                  if (!isValid) {
                    return;
                  }
                  
                  setIsLoading(true);
                  const success = await handleCaptchaSubmit();
                  if (!success) {
                    // If submission failed, stay on the current step
                    return;
                  }
                }
              } catch (error) {
                console.error('Error in form submission:', error);
                toast.error('An error occurred. Please try again.');
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading || isLoadingCaptcha || !isStepValid(currentStep)}
            className="ml-auto min-w-32 justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {currentStep === 3 ? 'Creating Account...' : 'Loading...'}
              </>
            ) : currentStep === 1 ? 'Next' : 
              currentStep === 2 ? 'Next' : 'Create Account'}
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  </div>
)
}
