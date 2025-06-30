import React from 'react'
import { Box, Button, H2, Input, Label } from '@adminjs/design-system'

const styles = {
  wrapper: {
    display: 'flex',
    height: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F2F2F2',
  },
  card: {
    width: 400,
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    padding: 30,
  },
  title: {
    marginBottom: 25,
    marginTop: 25,
    fontSize: 24,
    fontWeight: 700,
    color: '#242424',
    textAlign: 'center',
  },
  field: {
    marginBottom: 20,
  },
  input: {
    width: '100%',
  },
  loginBtn: {
    width: '100%',
    backgroundColor: '#FE8D1C',
    color: '#fff',
    fontWeight: 600,
  },
  logo: {
    display: 'flex',
    justifyContent: 'center',
  },
  logoImg: {
    height: 64,
    width: 64,
    objectFit: 'contain',
  },
}

const CustomLogin = () => {
  return (
    <Box style={styles.wrapper}>
      <Box as="form" action="/admin/login" method="POST" style={styles.card}>
        <div style={styles.logo}>
          <img src="/admin-assets/icon.png" alt="logo" style={styles.logoImg} />
        </div>
        <H2 style={styles.title}>Sign in to Vendoro Admin Panel</H2>

        <div style={styles.field}>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required style={styles.input} />
        </div>

        <div style={styles.field}>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required style={styles.input} />
        </div>

        <Button style={styles.loginBtn} type="submit">
          Sign In
        </Button>
      </Box>
    </Box>
  )
}

export default CustomLogin