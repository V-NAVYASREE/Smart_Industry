from marshmallow import Schema, fields, validate, validates_schema, ValidationError

# Role options
ROLE_CHOICES = ("admin", "worker")

class UserCreateSchema(Schema):
    name = fields.Str(required=True)
    email = fields.Email(required=True)
    password = fields.Str(required=True)
    role = fields.Str(required=True, validate=validate.OneOf(ROLE_CHOICES))
    zone_assigned = fields.Str(required=False, allow_none=True)
    age = fields.Int(required=False, allow_none=True)
    personalized_alerts = fields.Bool(missing=False)

class UserLoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)
