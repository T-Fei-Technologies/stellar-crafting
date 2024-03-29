import type { QueueItem } from '$lib/stores/queue';
import type { Ingredient } from '$lib/models/ingredient';
import type { Recipe } from '$lib/models/recipe';


export type IngredientWithQuantity = Ingredient & { quantity: number };


const getIngredientsFromRecipe = (
	recipe: Recipe,
	quantity: number,
	recipeList: Recipe[],
	ingredientsList: Map<string, Ingredient>
): IngredientWithQuantity[] => {
	// Leaving out recursive call for now until I can make a better breakdown of all the materials
	// Maybe by rendering a node chain of all the ingredients
	// const ingredients = recipe.ingredients.map(ingredient => {
	// 	const foundRecipe = recipeList.find(r => r.ingredientId === ingredient.id);
	//
	// 	if (foundRecipe) {
	// 		return getIngredientsFromRecipe(foundRecipe, Math.round(ingredient.quantity * quantity / foundRecipe.yield), recipeList, ingredientsList);
	// 	} else {
	// 		return [{ ...ingredientsList.get(ingredient.id), quantity: ingredient.quantity * quantity }];
	// 	}
	// }).flat(Infinity);

	const ingredients = recipe.ingredients.map<IngredientWithQuantity>(recipeIngredient => {
		const ingredient = ingredientsList.get(recipeIngredient.id);
		if (!ingredient) {
			throw new Error(`Ingredient with id ${recipeIngredient.id} not found`);
		}

		return {
			...ingredientsList.get(recipeIngredient.id),
			quantity: recipeIngredient.quantity * quantity,
		};
	});

	return ingredients.reduce((acc: IngredientWithQuantity[], ingredient: IngredientWithQuantity) => {
		const existingIngredient = acc.find(i => i.id === ingredient.id);

		if (existingIngredient) {
			existingIngredient.quantity = Math.ceil(existingIngredient.quantity + ingredient.quantity);
		} else {
			acc.push({ ...ingredient });
		}

		return acc;
	}, []);
};

export const getIngredientsFromQueue = (
	queue: QueueItem[],
	recipeList: Map<string, Recipe>,
	ingredientsList: Map<string, Ingredient>
): IngredientWithQuantity[] =>
	queue.reduce((acc, item) => {
		const ingredients = getIngredientsFromRecipe(
			item.recipe,
			item.quantity,
			Array.from(recipeList.values()),
			ingredientsList
		);
		ingredients.forEach(ingredient => {
			const existingIngredient: IngredientWithQuantity = acc.find(i => i.id === ingredient.id);

			if (existingIngredient) {
				existingIngredient.quantity += Math.ceil(ingredient.quantity);
			} else {
				acc.push({ ...ingredient });
			}
		});

		return acc;
	}, []);

