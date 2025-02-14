import { test, expect } from 'playwright-test-coverage';

test('Home page', async ({ page }) => {
  await page.goto('/');

  expect(await page.title()).toBe('JWT Pizza');
});

test('About page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'About' }).click();
  
    await expect(page.getByRole('main')).toContainText('The secret sauce');
});

test('Franchise page', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
  
    await expect(page.getByText('So you want a piece of the')).toBeVisible();
});

test('Register page', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Global').getByRole('link', { name: 'Register' }).click();
  
    await expect(page.getByText('Welcome to the party')).toBeVisible();
});

test('History page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'History' }).click();

    await expect(page.getByText('Mama Rucci, my my')).toBeVisible();
});

test('Docs page', async ({ page }) => {
    await page.goto('http://localhost:5173/docs');
    
    await expect(page.getByText('JWT Pizza API')).toBeVisible();
});

test('notFound page', async ({ page }) => {
    await page.goto('/');
    await page.goto('http://localhost:5173/dfsdfs');

    await expect(page.getByText('Oops')).toBeVisible();
});

test('Purchase with login', async ({ page }) => {
    await page.route('*/**/api/order/menu', async (route) => {
      const menuRes = [
        { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
        { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
      ];
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: menuRes });
    });
  
    await page.route('*/**/api/franchise', async (route) => {
      const franchiseRes = [
        {
          id: 2,
          name: 'LotaPizza',
          stores: [
            { id: 4, name: 'Lehi' },
            { id: 5, name: 'Springville' },
            { id: 6, name: 'American Fork' },
          ],
        },
        { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
        { id: 4, name: 'topSpot', stores: [] },
      ];
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: franchiseRes });
    });
  
    await page.route('*/**/api/auth', async (route) => {
      const loginReq = { email: 'd@jwt.com', password: 'a' };
      const loginRes = { user: { id: 3, name: 'Kai Chen', email: 'd@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
      expect(route.request().method()).toBe('PUT');
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    });
  
    await page.route('*/**/api/order', async (route) => {
      const orderReq = {
        items: [
          { menuId: 1, description: 'Veggie', price: 0.0038 },
          { menuId: 2, description: 'Pepperoni', price: 0.0042 },
        ],
        storeId: '4',
        franchiseId: 2,
      };
      const orderRes = {
        order: {
          items: [
            { menuId: 1, description: 'Veggie', price: 0.0038 },
            { menuId: 2, description: 'Pepperoni', price: 0.0042 },
          ],
          storeId: '4',
          franchiseId: 2,
          id: 23,
        },
        jwt: 'eyJpYXQ',
      };
      expect(route.request().method()).toBe('POST');
      expect(route.request().postDataJSON()).toMatchObject(orderReq);
      await route.fulfill({ json: orderRes });
    });
  
    await page.goto('/');
  
    // Go to order page
    await page.getByRole('button', { name: 'Order now' }).click();
  
    // Create order
    await expect(page.locator('h2')).toContainText('Awesome is a click away');
    await page.getByRole('combobox').selectOption('4');
    await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
    await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
    await expect(page.locator('form')).toContainText('Selected pizzas: 2');
    await page.getByRole('button', { name: 'Checkout' }).click();
  
    // Login
    await page.getByPlaceholder('Email address').click();
    await page.getByPlaceholder('Email address').fill('d@jwt.com');
    await page.getByPlaceholder('Email address').press('Tab');
    await page.getByPlaceholder('Password').fill('a');
    await page.getByRole('button', { name: 'Login' }).click();
  
    // Pay
    await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
    await expect(page.locator('tbody')).toContainText('Veggie');
    await expect(page.locator('tbody')).toContainText('Pepperoni');
    await expect(page.locator('tfoot')).toContainText('0.008 ₿');
    await page.getByRole('button', { name: 'Pay now' }).click();
  
    // Check balance
    await expect(page.getByText('0.008')).toBeVisible();
});

test('Register and logout', async ({ page }) => {
    // Login/Logout/Register user route
    await page.route('*/**/api/auth', async (route) => {
        const loginReq = { email: 'd@jwt.com', password: 'a' };
        const loginRes = { user: { id: 1, name: 'NAME', email: 'email@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
        const logoutRes = { message: 'logout successful' }

        if (route.request().method() === 'PUT') {
            await route.fulfill({ json: loginRes });
        } else if (route.request().method() === 'POST') {
            await route.fulfill({ json: loginRes });
        } else if (route.request().method() === 'DELETE') {
            await route.fulfill({ json: logoutRes });
        }
    });

    await page.goto('http://localhost:5173/');
    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByRole('textbox', { name: 'Full name' }).click();
    await page.getByRole('textbox', { name: 'Full name' }).fill('Test1');
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('test@email.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('test');
    await page.getByRole('button', { name: 'Register' }).click();

    await page.getByRole('link', { name: 'N', exact: true }).click();

    await page.getByRole('link', { name: 'Logout' }).click();
    await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
});

test('Login Admin, create/delete franchise', async ({ page }) => {
    // Login/Logout/Register admin route
    await page.route('*/**/api/auth', async (route) => {
        const loginReq = { email: 'd@jwt.com', password: 'a' };
        const loginRes = { user: { id: 1, name: 'NAME', email: 'email@jwt.com', roles: [{ role: 'admin' }] }, token: 'abcdef' };
        const logoutRes = { message: 'logout successful' }

        if (route.request().method() === 'PUT') {
            await route.fulfill({ json: loginRes });
        } else if (route.request().method() === 'POST') {
            await route.fulfill({ json: loginRes });
        } else if (route.request().method() === 'DELETE') {
            await route.fulfill({ json: logoutRes });
        }
    });
    // Create franchise route
    await page.route('*/**/api/franchise', async (route) => {
        const franchiseRes = {
            name: "testFranchise",
            admins: [
              {
                email: "f@jwt.com",
                id: 4,
                name: "pizza franchisee"
              }
            ],
            "id": 1
          };
        if(route.request().method() === 'POST') {
            await route.fulfill({ json: franchiseRes });
        }
    });

    // Get franchises route
    await page.route('*/**/api/franchise', async (route) => {
        const franchiseRes = [
          {
            id: 1,
            name: 'testFranchise',
            stores: [
              { id: 2, name: 'Test Location' },
            ],
          },
        ];
        if(route.request().method() === 'GET') {
            await route.fulfill({ json: franchiseRes });
        }
    });

    // Delete franchises route
    await page.route('*/**/api/franchise/2', async (route) => {
        const deleteRes = { message: 'franchise deleted' }
        if (route.request().method() === 'DELETE') {
            await route.fulfill({ json: deleteRes });
        }
        
    });

    await page.goto('http://localhost:5173/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('a');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.getByRole('link', { name: 'Admin' }).click();
    await page.getByRole('button', { name: 'Add Franchise' }).click();
    await page.getByRole('textbox', { name: 'franchise name' }).click();
    await page.getByRole('textbox', { name: 'franchise name' }).fill('testFranchise');
    await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
    await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('testFranchise@email.com');
    await page.getByRole('button', { name: 'Create' }).click();

    

    await page.getByRole('button', { name: 'Cancel' }).click();
    await page.getByRole('row', { name: 'testFranchise Close' }).getByRole('button').click();
    await page.getByRole('button', { name: 'Close' }).click();
   
});