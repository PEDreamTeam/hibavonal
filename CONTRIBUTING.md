# Contributing to HibaVonal

Thank you for your interest in contributing to HibaVonal! Please follow these guidelines when submitting changes.

## Branch Protection

⚠️ **Important**: The `main` branch is protected. **Direct pushes to the main branch are prohibited.**

All code changes must be made through pull requests on feature/development branches.

## Code Formatting

**Mandatory**: All code must be properly formatted before merging to the main branch.

The frontend project uses **Prettier** for code formatting. You must ensure all code is formatted according to Prettier standards before submitting a pull request.

### Frontend Code Formatting

1. Install dependencies:

   ```bash
   npm install
   ```

2. Format your code:

   ```bash
   npm run format
   ```

3. Check formatting without making changes:
   ```bash
   npm run format:check
   ```

## Workflow

1. Create a new branch from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Format your code (frontend):

   ```bash
   npm run format
   ```

4. Commit and push your changes

5. Submit a Pull Request to `main`

6. Ensure all checks pass and code formatting is correct before merge

## Code Style

- Follow Prettier formatting rules for consistent code style
- Write clear, descriptive commit messages
- Keep commits focused on a single feature or fix

Thank you for helping improve HibaVonal!
