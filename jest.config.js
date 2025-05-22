export default {
  roots: ["src"],
  transform: { 
    "^.+\\.tsx?$": "ts-jest" 
  },
  preset: 'ts-jest',
  testEnvironment: 'node'
};