const mockAccounts = [
  {
    password: 'Password@123',
    user: {
      userId: 1,
      fullName: 'Admin User',
      email: 'admin@mkt.com',
      role: 'ADMIN'
    }
  },
  {
    password: 'Password@123',
    user: {
      userId: 2,
      fullName: 'TechHub Owner',
      email: 'techhub@mkt.com',
      role: 'SELLER',
      approvalStatus: 'APPROVED'
    }
  },
  {
    password: 'Password@123',
    user: {
      userId: 4,
      fullName: 'Rahul Patil',
      email: 'rahul@mkt.com',
      role: 'BUYER'
    }
  }
]

export function mockLogin({ email, password }) {
  const account = mockAccounts.find((item) => item.user.email === email && item.password === password)

  if (!account) {
    throw new Error('Invalid email or password')
  }

  return {
    token: `mock-${account.user.userId}`,
    user: account.user
  }
}

export function mockMe(token) {
  const userId = Number(token.replace('mock-', ''))
  const account = mockAccounts.find((item) => item.user.userId === userId)

  if (!account) {
    throw new Error('Session expired')
  }

  return account.user
}

export function mockRegister({ email, role }) {
  return {
    userId: 5,
    role: role || 'BUYER'
  }
}
