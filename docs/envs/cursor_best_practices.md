
## Git Configuration

### Disable Git Pagination
To prevent issues with git output in the Cursor terminal, disable git pagination by running:
```bash
git config --global core.pager cat
```

This setting ensures git output is displayed directly in the terminal without using a pager, which can cause display issues in Cursor's terminal.
