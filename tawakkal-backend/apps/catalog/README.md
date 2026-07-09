# Catalog App

The Catalog app handles Categories and eventually Products, Variants, and related models.

## Category Tree Structure

Categories are implemented using an adjacency list approach with an explicit `parent` ForeignKey to self.
To optimize reads, we store computed fields:
- `path`: Example `Men/Hoodies/Premium`. This is automatically updated when a category name or parent changes.
- `level`: The integer depth of the category (0 for root).

### Important Validations
- **Max Depth**: The maximum category depth is capped at 10 levels to prevent UI and performance issues.
- **Circular References**: Validated on `clean()` and Service `update()` to ensure a category can never be its own ancestor.
- **Slug Generation**: Automatically generated from `name`. Duplicates are suffixed with `-2`, `-3`, etc.
- **Soft Deletion**: A category cannot be soft-deleted if it has active children.

## Repositories & Services

- `CategoryRepository`: Handles specialized queries like `get_root_categories()`, `get_tree()`, `get_flat()`, `reorder()`, and `search()`.
- `CategoryService`: Orchestrates the validations and path propagation. Propagates paths automatically to descendants when a category moves.

## API Endpoints

Categories are exposed under `/api/v1/admin/catalog/categories/`

### Special Endpoints
- `GET /tree/`: Returns all root categories with their nested children (hierarchical JSON structure).
- `GET /flat/`: Returns a flat list ordered alphabetically by `path`. Excellent for dropdown selections.
- `POST /bulk_delete/`: Accepts `{"ids": [...]}`. Soft-deletes provided categories.
- `POST /bulk_restore/`: Accepts `{"ids": [...]}`. Restores soft-deleted categories.
- `POST /bulk_status/`: Accepts `{"ids": [...], "status": true/false}`. Toggles active status.
- `POST /bulk_reorder/`: Accepts `{"ids": [...]}`. The index in the array dictates the new `display_order`.
