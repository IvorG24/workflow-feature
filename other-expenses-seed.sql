CREATE OR REPLACE FUNCTION seed_other_expenses()
RETURNS VOID AS $$
  plv8.subtransaction(function(){

    const otherExpensesData = [
      {
        category: "Airfare or train tickets",
        typeList: [
          "Airfare or train tickets",
          "Hotel accommodation",
          "Meals",
          "Rental car or transportation expenses",
          "Parking fees and tolls",
        ],
      },
      {
        category: "Business Meals and Entertainment",
        typeList: [
          "Meals with clients or colleagues during business travel",
          "Client entertainment expenses",
        ],
      },
      {
        category: "Mileage or Car Expenses",
        typeList: [
          "Mileage reimbursement for business-related use of personal vehicle",
          "Gasoline or fuel expenses",
          "Parking and toll fees",
        ],
      },
      {
        category: "Professional Development",
        typeList: [
          "Conference registration fees",
          "Workshop or seminar fees",
          "Professional association memberships",
        ],
      },
      {
        category: "Home Office Expenses",
        typeList: [
          "Internet and phone bills related to work",
          "Home office supplies",
          "Utility expenses",
        ],
      },
      {
        category: "Work-Related Education",
        typeList: [
          "Tuition fees for job-related courses",
          "Educational materials and books",
        ],
      },
      {
        category: "Cell Phone Expenses",
        typeList: ["Business-related calls", "Data plans used for work purposes"],
      },
    ];

    const TEAM_ID = 'a5a28977-6956-45c1-a624-b9e90911502e';

    otherExpensesData.forEach(expenses => {
      const category = plv8.execute(`INSERT INTO other_expenses_category_table (other_expenses_category, other_expenses_category_team_id) VALUES ('${expenses.category.toUpperCase()}', '${TEAM_ID}') RETURNING *`)[0];

      expenses.typeList.forEach(type => {
        plv8.execute(`INSERT INTO other_expenses_type_table (other_expenses_type, other_expenses_type_category_id) VALUES ('${type.toUpperCase()}', '${category.other_expenses_category_id}')`);
      });
    });
 });
$$ LANGUAGE plv8;
SELECT seed_other_expenses();
DROP FUNCTION IF EXISTS seed_other_expenses;