# Code Quality Tools

This project uses multiple code quality tools to ensure high-quality code and maintain coding standards.

## Tools Overview

### 1. SonarQube

SonarQube provides continuous code quality inspection covering:
- Code smells
- Bugs
- Vulnerabilities
- Security hotspots
- Test coverage
- Duplications

#### Setup

1. **SonarQube Server**:
   - Self-hosted: Follow [SonarQube installation guide](https://docs.sonarqube.org/latest/setup/install-server/)
   - Cloud: Use [SonarCloud](https://sonarcloud.io)

2. **Configuration**:
   - Add to GitHub Secrets:
     ```
     SONAR_TOKEN=your-sonar-token
     SONAR_HOST_URL=your-sonar-url
     ```
   - Project configuration in `sonar-project.properties`

3. **Local Analysis**:
   ```bash
   npm run sonar
   ```

### 2. CodeClimate

CodeClimate analyzes code quality metrics including:
- Maintainability
- Test coverage
- Code duplication
- Complexity

#### Setup

1. **CodeClimate Integration**:
   - Go to [CodeClimate Quality](https://codeclimate.com/quality)
   - Add your repository
   - Get the Reporter ID

2. **Configuration**:
   - Add to GitHub Secrets:
     ```
     CC_TEST_REPORTER_ID=your-reporter-id
     ```
   - Configuration in `.codeclimate.yml`

3. **Local Analysis**:
   ```bash
   npm run codeclimate
   ```

## Quality Gates

### SonarQube Quality Gates

Default quality gates:
- Coverage > 80%
- Duplicated Lines < 3%
- Maintainability Rating = A
- Reliability Rating = A
- Security Rating = A

### CodeClimate Thresholds

Configured thresholds:
- Maximum file length: 250 lines
- Maximum method length: 25 lines
- Maximum complexity: 5
- Maximum arguments: 4
- Maximum nested control flow: 4

## CI/CD Integration

Quality checks run automatically on:
- Push to main/develop
- Pull requests to main/develop
- Manual trigger via GitHub Actions

### GitHub Actions Workflow

The workflow in `.github/workflows/code-quality.yml`:
1. Runs tests with coverage
2. Executes SonarQube analysis
3. Checks SonarQube quality gate
4. Uploads results to CodeClimate

## Scripts

Available npm scripts:
```bash
npm run validate      # Run all quality checks
npm run test:coverage # Run tests with coverage
npm run sonar        # Run SonarQube analysis
npm run codeclimate  # Run CodeClimate analysis
```

## Best Practices

1. **Pre-commit**:
   - Run `npm run validate` before committing
   - Fix all issues or document exceptions

2. **Code Review**:
   - Check SonarQube and CodeClimate results
   - Address all new issues
   - Document technical debt

3. **Documentation**:
   - Document complex code
   - Update quality thresholds when needed
   - Keep this guide updated

## Troubleshooting

### Common Issues

1. **SonarQube Connection**:
   - Check SONAR_HOST_URL
   - Verify token permissions
   - Check network access

2. **CodeClimate Upload**:
   - Verify CC_TEST_REPORTER_ID
   - Check coverage file path
   - Review GitHub Actions logs

### Support

For issues:
1. Check the error message
2. Review relevant documentation
3. Check GitHub Actions logs
4. Contact the DevOps team 