# Summary

## Purpose

1. Current Formsly repository is written in MVP first mindset.
2. Start refactoring towards cleaner code, functionality first, and Mantine only design later polish mindset.

## Routes

Everything that is current user will not show URL. Current user id will be fetched via `useUser()`.

```txt
/
/notifications
/notifications?query...

/users/user-name

/teams/create
/teams/team-name/requests
/teams/team-name/requests/create
/teams/team-name/requests?query...
/teams/team-name/requests/<request_uid>
/teams/team-name/forms
/teams/team-name/forms/form-name
/teams/team-name/settings/profile

/settings/profile
/settings/account
/settings/appearance
/settings/notifications
/settings/security
/settings/teams

```

## References

1. [Why save color theme in cookie according to Mantine](https://mantine.dev/guides/dark-theme/#save-color-scheme-in-cookie)
2. [Mantine Responsive Layout](https://mantine.dev/core/app-shell/)
3. [Setup NavigationProgress](https://mantine.dev/others/nprogress/#setup-navigationprogress)
