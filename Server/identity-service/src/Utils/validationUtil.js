import Joi from "joi";

export const registerValidator = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().min(3).max(50).required(),
    lastName: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(10).max(10).required(),
    password: Joi.string().min(8).max(100).required(),
  });

  return schema.validate(data)
  
};

export const loginValidator = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(100).required(),
  });

  return schema.validate(data)
  
};
