import { Request, Response } from "express";
import prisma from "../connect";
import { ErrorCode } from "../exceptions/root";
import { AddressSchema, updateUserSchema } from "../schema/users";
import { BadRequestException } from "../exceptions/bad-request";
import { Address } from "@prisma/client";
import { UnauthorizedException } from "../exceptions/unauthorized";


const findAddress = async (addressId: number, userId: number) => {
    try {
        const address = await prisma.address.findFirstOrThrow({
            where: { id: addressId, userId },
        });
        return address;
    } catch (error) {
        throw new BadRequestException("Address not found", ErrorCode.ADDRESS_NOT_FOUND);
    }
}

export const createAddress = async (req: Request, res: Response) => {
    AddressSchema.parse(req.body)

    const address = await prisma.address.create({
        data: {
            ...req.body,
            userId: req?.user?.id,
        },
    });

    res.json(address);
};

export const updateUser = async (req: Request, res: Response) => {



    try {
        const validateData = updateUserSchema.parse(req.body);
        const userId = Number(req?.user?.id);

        // Validate and retrieve addresses if provided
        let shippingAddress: Address | undefined;
        let billingAddress: Address | undefined;

        if (validateData.defaultShippingAddress) {
            shippingAddress = await findAddress(validateData.defaultShippingAddress, userId);
        }

        if (validateData.defaultBillingAddress) {
            billingAddress = await findAddress(validateData.defaultBillingAddress, userId);
        }

        // Update user data
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...validateData,
                defaultShippingAddress: shippingAddress?.id,
                defaultBillingAddress: billingAddress?.id,
            },
        });

        res.json({ message: "success", data: updatedUser });
    } catch (error) {
        // Handle any exceptions (e.g., validation errors)
        throw new BadRequestException("Error updating user", ErrorCode.UNPROCESSABLE_ENTITY);
    }
}


export const deleteAddress = async (req: Request, res: Response) => {

    try {
        const addressId = Number(req.params.id);
        const userId = req.user?.id;

        // Find the address
        const address = await findAddress(addressId, userId!);

        if (!address) {
            throw new UnauthorizedException("Unauthorized", ErrorCode.NO_AUTRHORIZED);
        }

        // Delete the address
        await prisma.address.delete({
            where: { id: addressId },
        });

        res.json({ message: "Address deleted successfully" });
    } catch (error) {
        throw new BadRequestException("Error updating user", ErrorCode.UNPROCESSABLE_ENTITY);
    }
};


export const getAddress = async (req: Request, res: Response) => {
    const address = await prisma.address.findMany({ where: { userId: req?.user?.id } });
    res.json({ message: "success", data: address, });
};

export const getAddressById = async (req: Request, res: Response) => {
    const address = await prisma.address.findUnique({
        where: { id: Number(req.params.id) },
    });

    res.json(address);
};
