import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ybkqwrfobkcvvwttrrud.supabase.com'
const supabaseAnonKey = import.meta.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlia3F3cmZvYmtjdnZ3dHRycnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMjk3MDksImV4cCI6MjA2MDYwNTcwOX0.utx7l-N1D-hw4FAU0iDKI2EHz1dPHrgUxvf20GnzPLk

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
