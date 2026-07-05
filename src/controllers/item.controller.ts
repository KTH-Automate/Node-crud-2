import { Response } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from '../config/db';
import { items } from '../db/schema';
import { AuthenticatedRequest } from '../middleware/auth';

export const createItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, price } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }

    const [newItem] = await db.insert(items).values({
      name,
      description: description || null,
      price: numericPrice,
      userId,
    }).returning();

    return res.status(201).json({
      message: 'Item created successfully',
      item: newItem,
    });
  } catch (error) {
    console.error('Create item error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getItems = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Retrieve all items belonging to the authenticated user
    const userItems = await db.select().from(items).where(eq(items.userId, userId));

    return res.status(200).json({ items: userItems });
  } catch (error) {
    console.error('Get items error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getItemById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      return res.status(400).json({ message: 'Invalid item ID' });
    }

    const [item] = await db.select().from(items).where(
      and(
        eq(items.id, itemId),
        eq(items.userId, userId)
      )
    ).limit(1);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    return res.status(200).json({ item });
  } catch (error) {
    console.error('Get item by ID error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      return res.status(400).json({ message: 'Invalid item ID' });
    }

    // Check if the item exists and belongs to the user
    const [existingItem] = await db.select().from(items).where(
      and(
        eq(items.id, itemId),
        eq(items.userId, userId)
      )
    ).limit(1);

    if (!existingItem) {
      return res.status(404).json({ message: 'Item not found or unauthorized' });
    }

    // Prepare update data
    const updateData: Partial<typeof items.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) {
      const numericPrice = Number(price);
      if (isNaN(numericPrice) || numericPrice < 0) {
        return res.status(400).json({ message: 'Price must be a positive number' });
      }
      updateData.price = numericPrice;
    }

    const [updatedItem] = await db
      .update(items)
      .set(updateData)
      .where(
        and(
          eq(items.id, itemId),
          eq(items.userId, userId)
        )
      )
      .returning();

    return res.status(200).json({
      message: 'Item updated successfully',
      item: updatedItem,
    });
  } catch (error) {
    console.error('Update item error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      return res.status(400).json({ message: 'Invalid item ID' });
    }

    // Check if the item exists and belongs to the user
    const [existingItem] = await db.select().from(items).where(
      and(
        eq(items.id, itemId),
        eq(items.userId, userId)
      )
    ).limit(1);

    if (!existingItem) {
      return res.status(404).json({ message: 'Item not found or unauthorized' });
    }

    await db.delete(items).where(
      and(
        eq(items.id, itemId),
        eq(items.userId, userId)
      )
    );

    return res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
