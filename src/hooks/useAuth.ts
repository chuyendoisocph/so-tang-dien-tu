import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const checkingRoles = useRef(false);

  const checkUserRoles = useCallback(async (userId: string) => {
    // Prevent duplicate calls
    if (checkingRoles.current) return;
    checkingRoles.current = true;

    // Use cached role immediately for faster UX
    const cachedRole = localStorage.getItem('user_role');
    if (cachedRole === 'admin') {
      setIsAdmin(true);
      setRolesLoaded(true);
    } else if (cachedRole === 'employee') {
      setIsEmployee(true);
      setRolesLoaded(true);
    }

    try {
      // Create a promise that rejects after 8 seconds (increased timeout)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 8000);
      });

      // Race between the query and timeout
      const queryPromise = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const result = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (result?.error) {
        console.error('Error checking user roles:', result.error);
        // Keep cached values if query fails
        if (!cachedRole) {
          setIsAdmin(false);
          setIsEmployee(false);
        }
      } else if (result?.data) {
        const roles = result.data.map((r: any) => r.role) || [];
        setIsAdmin(roles.includes('admin'));
        setIsEmployee(roles.includes('employee'));
      }
    } catch (error: any) {
      // On timeout, keep using cached role (already set above)
      if (!cachedRole) {
        console.warn('Role check timed out, no cache available');
      }
    } finally {
      setRolesLoaded(true);
      checkingRoles.current = false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await checkUserRoles(session.user.id);
        } else {
          setRolesLoaded(true);
        }
        setLoading(false);
      } catch (error) {
        console.error('Init auth error:', error);
        setLoading(false);
        setRolesLoaded(true);
      }
    };

    // Set up auth state listener - only handle changes after init
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        // Skip events that initAuth handles
        if (event === 'INITIAL_SESSION') return;
        
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_OUT') {
          setIsAdmin(false);
          setIsEmployee(false);
          setRolesLoaded(true);
          localStorage.removeItem('user_role');
        }
        // For SIGNED_IN, roles will be checked by the component that triggered sign in
      }
    );

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkUserRoles]);

  // Cache role when it changes
  useEffect(() => {
    if (isAdmin) {
      localStorage.setItem('user_role', 'admin');
    } else if (isEmployee) {
      localStorage.setItem('user_role', 'employee');
    }
  }, [isAdmin, isEmployee]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsEmployee(false);
      setRolesLoaded(false);
    }
    return { error };
  };

  // Loading is true until both auth and roles are loaded
  const isLoading = loading || (user !== null && !rolesLoaded);

  return {
    user,
    session,
    loading: isLoading,
    isAdmin,
    isEmployee,
    rolesLoaded,
    signIn,
    signOut,
  };
}
