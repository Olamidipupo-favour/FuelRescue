# Nigerian Verification Helper

This helper provides a simple interface for verifying Nigerian identity documents:

- NIN (National Identification Number)
- BVN (Bank Verification Number)
- Driver's License
- Voter's Card

## Installation

The module is already part of your FuelRescue backend. Make sure you have the required dependencies:

```bash
npm install --save @nestjs/config axios
```

## Configuration

Add the following to your `.env` file:

```
# Nigerian Verification API
VERIFICATION_API_KEY=your-verification-api-key
VERIFICATION_API_URL=https://api.youverify.co
```

## Usage

### Step 1: Import the module

```typescript
import { Module } from '@nestjs/common';
import { NigerianVerificationModule } from './helpers/verification/nigerian-verification.module';

@Module({
  imports: [
    // ... other imports
    NigerianVerificationModule,
  ],
})
export class AppModule {}
```

### Step 2: Inject and use the helper

```typescript
import { Injectable } from '@nestjs/common';
import { NigerianVerificationHelper } from '../../helpers/verification/nigerian-verification.helper';

@Injectable()
export class YourService {
  constructor(private nigerianVerification: NigerianVerificationHelper) {}

  async verifyUserNin(userId: string, nin: string) {
    try {
      // Primary verification (NIN or BVN)
      const result = await this.nigerianVerification.primaryVerification('nin', nin);
      
      if (result.success) {
        // Handle successful verification
        return {
          success: true,
          message: 'NIN verification successful',
        };
      }
      
      return {
        success: false,
        message: 'NIN verification failed',
      };
    } catch (error) {
      // Handle errors
      throw error;
    }
  }

  async verifyDriversLicense(userId: string, licenseNumber: string) {
    try {
      // Secondary verification (Driver's License or Voter's Card)
      const result = await this.nigerianVerification.secondaryVerification("driver's license", licenseNumber);
      
      // Process the result
      // ...
    } catch (error) {
      // Handle errors
      // ...
    }
  }
}
```

## Development Mode

In development mode (or when no API key is provided), the helper will return mock responses for testing.

## API Reference

### primaryVerification(meansOfId: string, regNo: string): Promise<any>

Verify primary identity documents (NIN, BVN)

- `meansOfId`: 'nin' or 'bvn'
- `regNo`: The identification number

### secondaryVerification(meansOfId: string, regNo: string): Promise<any>

Verify secondary identity documents (Driver's License, Voter's Card)

- `meansOfId`: 'driver's license' or 'voter's card'
- `regNo`: The identification number

## Response Format

Successful verification:

```json
{
  "success": true,
  "data": {
    "status": "found",
    "first_name": "John",
    "last_name": "Doe",
    "dob": "1990-01-01",
    "gender": "male",
    "nin": "1234567890"
  }
}
```

Failed verification:

```json
{
  "success": false,
  "error": "Error message here"
}
``` 