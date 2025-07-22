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
import { FaGithub, FaApple, FaMicrosoft } from 'react-icons/fa'

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
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [isAppleLoading, setIsAppleLoading] = useState(false)
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false)
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
      
      // Auto-login after registration
      try {
        const loginResult = await signIn('credentials', {
          email: formData.email.trim(),
          password: formData.password,
          redirect: false,
          callbackUrl: '/profile',
        });
        if (loginResult?.error) {
          toast.error('Account created, but failed to log in. Please sign in manually.', { id: toastId });
          router.push('/login?registered=true');
        } else {
          toast.success('Logged in successfully!', { id: toastId });
          router.push('/profile');
        }
      } catch (e) {
        router.push('/login?registered=true');
      }
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

  const handleProviderSignIn = async (provider: string, setLoading: (v: boolean) => void) => {
    try {
      setLoading(true)
      await signIn(provider, { callbackUrl: '/profile', redirect: true })
    } catch (error) {
      toast.error(`Failed to sign up with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`)
    } finally {
      setLoading(false)
    }
  }

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
        </CardTitle>
        <CardDescription className="text-center text-xs">
          Sign up with a provider to create your account
        </CardDescription>

        <div className="py-4 space-y-2">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center"
            disabled={isGoogleLoading}
            onClick={() => handleProviderSignIn('google', setIsGoogleLoading)}
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Google</span>
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Google
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center"
            disabled={isGithubLoading}
            onClick={() => handleProviderSignIn('github', setIsGithubLoading)}
          >
            {isGithubLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>GitHub</span>
              </>
            ) : (
              <>
                <FaGithub className="mr-2 h-4 w-4" />
                GitHub
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center"
            disabled={isAppleLoading}
            onClick={() => handleProviderSignIn('apple', setIsAppleLoading)}
          >
            {isAppleLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Apple</span>
              </>
            ) : (
              <>
                <FaApple className="mr-2 h-4 w-4" />
                Apple
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center"
            disabled={isMicrosoftLoading}
            onClick={() => handleProviderSignIn('microsoft', setIsMicrosoftLoading)}
          >
            {isMicrosoftLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Microsoft</span>
              </>
            ) : (
              <>
                <FaMicrosoft className="mr-2 h-4 w-4" />
                Microsoft
              </>
            )}
          </Button>
        </div>
      </CardHeader>
    </Card>
  </div>
  )
}
