#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
VERBOSE=false
for arg in "$@"; do
    case $arg in
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        *)
            echo "Unknown option: $arg"
            exit 1
            ;;
    esac
done

# Test counts
UNIT_TESTS=0
INTEGRATION_TESTS=0
E2E_TESTS=0
TOTAL_TESTS=0

# Function to print section headers
print_section() {
    echo -e "\n${YELLOW}=== $1 ===${NC}"
}

# Function to count tests in a file
count_tests() {
    local file=$1
    local count=$(grep -c "it(" "$file" || echo 0)
    echo $count
}

# Function to count tests in a directory
count_tests_in_dir() {
    local dir=$1
    local type=$2
    local count=0
    for file in $(find "$dir" -name "*.test.ts" -o -name "*.test.tsx"); do
        count=$((count + $(count_tests "$file")))
    done
    case $type in
        unit) UNIT_TESTS=$((UNIT_TESTS + count)) ;;
        integration) INTEGRATION_TESTS=$((INTEGRATION_TESTS + count)) ;;
        e2e) E2E_TESTS=$((E2E_TESTS + count)) ;;
    esac
    TOTAL_TESTS=$((TOTAL_TESTS + count))
}

# Function to run a command and capture its output
run_check() {
    local cmd="$1"
    local log_file="/tmp/$(basename "$0").$$.log"
    
    echo -e "\n${GREEN}Running: $cmd${NC}"
    
    if $VERBOSE; then
        if $cmd 2>&1 | tee "$log_file"; then
            echo -e "${GREEN}✓ Success${NC}"
        else
            echo -e "${RED}✗ Failed${NC}"
            cat "$log_file"
            rm "$log_file"
            exit 1
        fi
    else
        if $cmd > "$log_file" 2>&1; then
            echo -e "${GREEN}✓ Success${NC}"
        else
            echo -e "${RED}✗ Failed${NC}"
            cat "$log_file"
            rm "$log_file"
            exit 1
        fi
    fi
    
    rm "$log_file"
}

# 1. Code Quality Checks
print_section "Running Code Quality Checks"
run_check "npm run lint:strict"
run_check "npm run type-check"
run_check "npm run format:check"

# 2. Testing
print_section "Running Tests"
run_check "npm run test:unit"
count_tests_in_dir "tests/unit" "unit"
run_check "npm run test:integration"
count_tests_in_dir "tests/integration" "integration"
run_check "npm run test:e2e"
count_tests_in_dir "tests/e2e" "e2e"

# 3. Coverage
print_section "Checking Test Coverage"
run_check "npm run test:coverage"

# 4. SonarQube Analysis
print_section "Running SonarQube Analysis"
run_check "npm run sonar"

# 5. CodeClimate Analysis
print_section "Running CodeClimate Analysis"
run_check "npm run codeclimate"

# 6. Build Verification
print_section "Verifying Build"
run_check "npm run build"

# 7. Security Checks
print_section "Running Security Checks"
run_check "npm audit"
run_check "npm run security:check"

# 8. Documentation Checks
print_section "Checking Documentation"
run_check "npm run docs:check"

# Print test summary
echo -e "\n${BLUE}=== Test Summary ===${NC}"
echo -e "${GREEN}Unit Tests:${NC} $UNIT_TESTS"
echo -e "${GREEN}Integration Tests:${NC} $INTEGRATION_TESTS"
echo -e "${GREEN}E2E Tests:${NC} $E2E_TESTS"
echo -e "${YELLOW}Total Tests:${NC} $TOTAL_TESTS"

echo -e "\n${GREEN}All checks completed successfully!${NC}" 