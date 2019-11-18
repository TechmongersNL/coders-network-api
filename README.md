

```bash
# Signup
http -v POST :5000/signup email=hello@klve.nl password=secret name="Kelley van Evert"

# Login
http -v POST :5000/login email=hello@klve.nl password=secret

# Check whether authenticated
http -v GET :5000/authenticated
http -v GET :5000/authenticated Authorization:"Bearer JWT_HERE"

# Get a developer's profile:
http -v GET :5000/developers/1
```
