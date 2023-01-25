# Summary

## Purpose

1. Current Formsly repository is written in MVP first mindset.
2. Start refactoring towards cleaner code, functionality first, and Mantine only design later polish mindset.

## Routes

Everything that is current user will not show URL. Current user id will be fetched via `useUser()`.

```txt
/
/onboarding
/team/team-name/notifications
/team/team-name/notifications?query...

/team/team-name/users/user-name
/team/team-name/users/username/settings/profile
/team/team-name/users/username/settings/notifications
/team/team-name/users/username/settings/security
/team/team-name/users/username/settings/teams

/teams/create
/teams/team-name/requests
/teams/team-name/requests/create
/teams/team-name/requests?query...
/teams/team-name/requests/<request_uid>
/teams/team-name/forms
/teams/team-name/forms/form-name
/teams/team-name/settings/profile
```

## References

1. [Why save color theme in cookie according to Mantine](https://mantine.dev/guides/dark-theme/#save-color-scheme-in-cookie)
2. [Mantine Responsive Layout](https://mantine.dev/core/app-shell/)
3. [Setup NavigationProgress](https://mantine.dev/others/nprogress/#setup-navigationprogress)
4. Use mantine createStyles because recommended.
