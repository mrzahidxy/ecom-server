import { Request, Response } from "express";
import { compareSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../connect";

export const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  let user = await prisma.user.findFirst({
    where: { email },
  });

  if (user) {
    res.json("User already exists");
    return;
  }

  user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashSync(password, 10),
    },
  });

  res.json(user);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  let user = await prisma.user.findFirst({
    where: { email },
  });

  if (!user) {
    res.json("No user found");
    return;
  }

  if (!compareSync(password, user.password)) {
    res.json("Wrong password");
    return;
  }

  const token = jwt.sign({ id: user.id }, "secret", { expiresIn: "1d" });

  res.json({ user, token });
};
