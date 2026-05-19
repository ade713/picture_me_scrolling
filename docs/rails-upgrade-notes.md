# Rails Upgrade Notes

## Future API Controller Cleanup

The API controllers currently declare `before_action :require_logged_in` directly where authenticated access is required. This is explicit and fine for the current app size.

When the app is closer to a Rails 8 upgrade, consider introducing an `Api::BaseController` for shared API behavior, such as:

- authenticated API guards
- consistent JSON error responses
- API-specific controller defaults

This can keep `ApplicationController` focused on app-wide browser behavior while giving JSON API controllers a clearer shared home.
