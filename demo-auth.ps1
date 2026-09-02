Write-Host '=== WESTOS AUTH SYSTEM DEMO ==='
Write-Host ''

# 1. HEALTH CHECK
Write-Host '1. Health Check:'
$health = Invoke-WebRequest -Uri 'http://localhost:3001/api/v1/health' -Method GET -UseBasicParsing
$healthData = $health.Content | ConvertFrom-Json
Write-Host "   Status: $($health.StatusCode) - $($healthData.data.status)"
Write-Host ''

# 2. REGISTER NEW USER
Write-Host '2. Register New User:'
$email = 'demo-' + (Get-Random) + '@example.com'
$password = 'DemoPass123!'
$body = @{ email = $email; password = $password; firstName = 'Demo'; lastName = 'User' } | ConvertTo-Json
$register = Invoke-WebRequest -Uri 'http://localhost:3001/api/v1/auth/register' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing
$regData = $register.Content | ConvertFrom-Json
Write-Host "   Status: $($register.StatusCode)"
Write-Host "   Access Token: $($regData.data.accessToken.Substring(0,50))..."
Write-Host "   Refresh Token: $($regData.data.refreshToken.Substring(0,50))..."
$authToken = $regData.data.accessToken
$refreshToken = $regData.data.refreshToken
Write-Host ''

# 3. LOGIN
Write-Host '3. Login with Credentials:'
$body = @{ email = $email; password = $password } | ConvertTo-Json
$login = Invoke-WebRequest -Uri 'http://localhost:3001/api/v1/auth/login' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing
$loginData = $login.Content | ConvertFrom-Json
Write-Host "   Status: $($login.StatusCode)"
Write-Host "   Access Token: $($loginData.data.accessToken.Substring(0,50))..."
$authToken = $loginData.data.accessToken
$refreshToken = $loginData.data.refreshToken
Write-Host ''

# 4. GET PROFILE (PROTECTED)
Write-Host '4. Get Current User Profile (Protected):'
$me = Invoke-WebRequest -Uri 'http://localhost:3001/api/v1/auth/me' -Method GET -Headers @{Authorization = "Bearer $authToken"} -UseBasicParsing
$meData = $me.Content | ConvertFrom-Json
Write-Host "   Status: $($me.StatusCode)"
Write-Host "   User ID: $($meData.data.id)"
Write-Host "   Email: $($meData.data.email)"
Write-Host "   Email Verified: $($meData.data.emailVerified)"
Write-Host "   Status: $($meData.data.status)"
Write-Host ''

# 5. REFRESH TOKEN
Write-Host '5. Refresh Access Token:'
$body = @{ refreshToken = $refreshToken } | ConvertTo-Json
$refresh = Invoke-WebRequest -Uri 'http://localhost:3001/api/v1/auth/refresh' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing
$refreshData = $refresh.Content | ConvertFrom-Json
Write-Host "   Status: $($refresh.StatusCode)"
Write-Host "   New Access Token: $($refreshData.data.accessToken.Substring(0,50))..."
$authToken = $refreshData.data.accessToken
Write-Host ''

# 6. LOGOUT
Write-Host '6. Logout:'
$body = @{ refreshToken = $refreshToken } | ConvertTo-Json
$logout = Invoke-WebRequest -Uri 'http://localhost:3001/api/v1/auth/logout' -Method POST -Body $body -ContentType 'application/json' -Headers @{Authorization = "Bearer $authToken"} -UseBasicParsing
$logoutData = $logout.Content | ConvertFrom-Json
Write-Host "   Status: $($logout.StatusCode)"
Write-Host "   Message: $($logoutData.data.message)"
Write-Host ''

# 7. ERROR CASES
Write-Host '7. Error Cases:'
Write-Host '   a) Invalid email format:'
$body = @{ email = 'invalid'; password = 'TestPass123!'; firstName = 'Test'; lastName = 'User' } | ConvertTo-Json
$err = Invoke-WebRequest -Uri 'http://localhost:3001/api/v1/auth/register' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing -ErrorAction SilentlyContinue
$errData = $err.Content | ConvertFrom-Json
Write-Host "      Status: $($err.StatusCode) - $($errData.error.code)"

Write-Host '   b) Wrong password:'
$body = @{ email = $email; password = 'WrongPass123!' } | ConvertTo-Json
$err = Invoke-WebRequest -Uri 'http://localhost:3001/api/v1/auth/login' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing -ErrorAction SilentlyContinue
$errData = $err.Content | ConvertFrom-Json
Write-Host "      Status: $($err.StatusCode) - $($errData.error.code)"

Write-Host '   c) Duplicate email:'
$body = @{ email = $email; password = 'TestPass123!'; firstName = 'Test'; lastName = 'User' } | ConvertTo-Json
$err = Invoke-WebRequest -Uri 'http://localhost:3001/api/v1/auth/register' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing -ErrorAction SilentlyContinue
$errData = $err.Content | ConvertFrom-Json
Write-Host "      Status: $($err.StatusCode) - $($errData.error.code)"

Write-Host '   d) Unauthorized (no token):'
$err = Invoke-WebRequest -Uri 'http://localhost:3001/api/v1/auth/me' -Method GET -UseBasicParsing -ErrorAction SilentlyContinue
$errData = $err.Content | ConvertFrom-Json
Write-Host "      Status: $($err.StatusCode) - $($errData.error.code)"

Write-Host ''
Write-Host '=== AUTH DEMO COMPLETE ==='