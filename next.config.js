/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

// Fix danfojs import https://stackoverflow.com/questions/66244968/cannot-use-import-statement-outside-a-module-error-when-importing-react-hook-m
const withTM = require('next-transpile-modules')(['danfojs'])

module.exports = withTM(nextConfig)
