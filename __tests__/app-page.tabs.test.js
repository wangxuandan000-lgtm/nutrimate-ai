import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('next/navigation', () => ({
	useRouter: () => ({ replace: jest.fn(), push: jest.fn(), prefetch: jest.fn() }),
}));

import * as api from '../src/lib/api';
import AppProviders from '../src/app/providers';
import AppPage from '../src/app/app/page';

describe('NutriMate AI desktop web app', () => {
	beforeEach(() => {
		jest.restoreAllMocks();
		jest.spyOn(api, 'getStoredToken').mockImplementation(() => 'test-token');
		jest.spyOn(api, 'parseJwt').mockImplementation(() => ({ userID: '123', username: 'test' }));
	});

	function renderApp() {
		render(
			<AppProviders>
				<AppPage />
			</AppProviders>
		);
	}

	async function clickNav(user, name) {
		await user.click(screen.getAllByRole('button', { name })[0]);
	}

	test('Home: shows the desktop health dashboard by default', async () => {
		jest.spyOn(api.RecipesAPI, 'list').mockResolvedValueOnce({ recipes: [] });

		renderApp();

		expect(await screen.findByText('Hi，今天想吃得更健康一点吗？')).toBeInTheDocument();
		expect(screen.getByText('NutriMate AI')).toBeInTheDocument();
		expect(screen.getAllByRole('button', { name: 'AI Plan' })[0]).toBeInTheDocument();
		expect(screen.getByText('今日推荐餐单')).toBeInTheDocument();
	});

	test('AI Plan: generates and displays mock AI meal plan results', async () => {
		const user = userEvent.setup();
		jest.spyOn(api.RecipesAPI, 'list').mockResolvedValueOnce({ recipes: [] });

		renderApp();

		await clickNav(user, 'AI Plan');
		expect(await screen.findByRole('heading', { name: 'AI Plan' })).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: 'Generate AI Meal Plan' }));

		expect(await screen.findByText('AI 生成结果')).toBeInTheDocument();
		expect(screen.getByText('营养评分')).toBeInTheDocument();
		expect(await screen.findByText('午餐：三文鱼菠菜糙米碗')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Add to Shopping List' })).toBeInTheDocument();
	});

	test('Recipes: shows mock recipe grid and opens recipe detail', async () => {
		const user = userEvent.setup();
		jest.spyOn(api.RecipesAPI, 'list').mockResolvedValueOnce({ recipes: [] });

		renderApp();

		await clickNav(user, 'Recipes');
		expect(await screen.findByRole('heading', { name: 'Recipes' })).toBeInTheDocument();
		expect(screen.getByPlaceholderText('搜索菜名、标签或食材')).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: /三文鱼菠菜糙米碗/ }));

		expect(await screen.findByRole('heading', { name: '三文鱼菠菜糙米碗' })).toBeInTheDocument();
		expect(screen.getByText('食材清单')).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: '加入购物清单' }));
		expect(await screen.findByRole('heading', { name: 'Shopping' })).toBeInTheDocument();
		expect(screen.getByText('自动生成的本周购物清单，和 AI Plan 保持同步。')).toBeInTheDocument();
	});

	test('Recipes: preserves original recipe management add flow', async () => {
		const user = userEvent.setup();
		jest.spyOn(api.RecipesAPI, 'list').mockResolvedValueOnce({ recipes: [] });
		const createSpy = jest.spyOn(api.RecipesAPI, 'create').mockResolvedValueOnce({ ok: true });
		jest.spyOn(api.RecipesAPI, 'list').mockResolvedValueOnce({ recipes: [] });

		renderApp();

		await clickNav(user, 'Recipes');
		await screen.findByText('暂无自建菜谱。可以点击 Add Recipe 添加你的第一道健康菜。');

		await user.click(screen.getByRole('button', { name: 'Add Recipe' }));
		expect(await screen.findByRole('heading', { name: 'Add Recipe' })).toBeInTheDocument();

		await user.type(screen.getByLabelText('Title'), 'Tomato Soup');
		await user.type(screen.getByPlaceholderText('Add ingredient and press Enter'), 'tomato{enter}');
		await user.type(screen.getByLabelText('Steps'), 'Blend{enter}Heat');

		await user.click(screen.getByRole('button', { name: 'Add' }));

		await waitFor(() => expect(createSpy).toHaveBeenCalledTimes(1));
		expect(createSpy).toHaveBeenCalledWith({
			title: 'Tomato Soup',
			description: 'Blend\nHeat'.slice(0, 120),
			ingredients: [{ name: 'tomato' }],
			steps: ['Blend', 'Heat'],
		}, 'test-token');
	});

	test('Pantry: shows inventory cards with status labels', async () => {
		const user = userEvent.setup();
		jest.spyOn(api.RecipesAPI, 'list').mockResolvedValueOnce({ recipes: [] });

		renderApp();

		await clickNav(user, 'Pantry');

		expect(await screen.findByRole('heading', { name: 'Pantry' })).toBeInTheDocument();
		expect(screen.getByText('总食材数量')).toBeInTheDocument();
		expect(screen.getAllByText('即将过期')[0]).toBeInTheDocument();
		expect(screen.getAllByText('库存不足')[0]).toBeInTheDocument();
		expect(screen.getByText('AI 推荐菜谱')).toBeInTheDocument();
	});

	test('Shopping: shopping list items can be checked', async () => {
		const user = userEvent.setup();
		jest.spyOn(api.RecipesAPI, 'list').mockResolvedValueOnce({ recipes: [] });

		renderApp();

		await clickNav(user, 'Shopping');

		const blueberryRow = await screen.findByText('蓝莓');
		const checkbox = within(blueberryRow.closest('label')).getByRole('checkbox');
		expect(checkbox).not.toBeChecked();

		await user.click(checkbox);
		expect(checkbox).toBeChecked();
	});

	test('Profile: shows user preferences and nutrition report', async () => {
		const user = userEvent.setup();
		jest.spyOn(api.RecipesAPI, 'list').mockResolvedValueOnce({ recipes: [] });

		renderApp();

		await clickNav(user, 'Profile');

		expect(await screen.findByText('Mia')).toBeInTheDocument();
		expect(screen.getByText('AI 健康评分')).toBeInTheDocument();
		expect(screen.getByText('本周蛋白质摄入较稳定，适合继续保持。')).toBeInTheDocument();
	});
});
