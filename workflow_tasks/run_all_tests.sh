#!/bin/bash

# Exit on error
set -e

# Set environment variables
export NODE_ENV=test
export TS_NODE_PROJECT=tsconfig.json

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print section headers
print_section() {
  echo -e "\n${YELLOW}=== $1 ===${NC}\n"
}

# Function to print error details
print_error_details() {
  local error_file="tests/error.log"
  if [ -f "$error_file" ]; then
    print_section "Error Details"
    echo -e "${RED}Last 10 lines of error log:${NC}"
    tail -n 10 "$error_file"
  fi
}

# Function to print test summary
print_test_summary() {
  local coverage_file="tests/coverage/coverage-summary.json"
  
  if [ -f "$coverage_file" ]; then
    print_section "Coverage Summary"
    echo "Coverage report generated at: tests/coverage/index.html"
    echo "Summary:"
    cat "$coverage_file" | grep -E '"total":' | sed 's/^/  /'
  fi

  print_section "Test Summary"
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed successfully!${NC}"
  else
    echo -e "${RED}✗ Some tests failed.${NC}"
    echo -e "${BLUE}Check the following for details:${NC}"
    echo "  - Test output above"
    echo "  - Error logs in tests/error.log"
    echo "  - Coverage report in tests/coverage/"
    echo -e "\n${YELLOW}Common issues to check:${NC}"
    echo "  - Missing .js extensions in imports"
    echo "  - Module resolution errors"
    echo "  - TypeScript configuration issues"
    echo "  - Test environment setup problems"
  fi
}

# Create error log directory if it doesn't exist
mkdir -p tests

# Run tests with coverage and capture output
print_section "Running Tests"
npm run test:coverage 2>&1 | tee tests/error.log

# Capture the exit code
TEST_EXIT_CODE=${PIPESTATUS[0]}

# Print summary
print_test_summary $TEST_EXIT_CODE

# Print error details if tests failed
if [ $TEST_EXIT_CODE -ne 0 ]; then
  print_error_details
fi

# Exit with the test status
exit $TEST_EXIT_CODE 