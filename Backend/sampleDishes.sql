INSERT INTO Dishes (id, Name, Description, Calories, Protein, Carbs, Fat, isPublic, Rates, OwnerId) VALUES
-- GRUPA 1: "ŚWIĘTE GRAALE" (Top Oceny)
-- Zauważ: ID 4 jest ukryte (0). Mimo świetnych statystyk, nie powinno się pojawić.
(1, 'Pizza Neapolitana Premium', 'Włoska', 850, 35, 110, 38, 1, 5.00, 1),
(2, 'Sushi Master Set', 'Japońska', 450, 25, 65, 8, 1, 4.95, 2),
(3, 'Spaghetti Carbonara Oryginał', 'Włoska', 780, 30, 85, 45, 1, 4.90, 3),
(4, 'Ramen Tonkotsu', 'Japońska', 600, 28, 55, 30, 0, 4.85, 1), -- UKRYTE
(5, 'Lasagne Bolognese', 'Włoska', 820, 40, 70, 48, 1, 4.80, 2),

-- GRUPA 2: "UKRYTE DIAMENTY"
(10, 'Domowe Pierogi Babci', 'Polska', 550, 18, 90, 20, 1, 5.00, 3),
(11, 'Rzemieślniczy Burger', 'Amerykańska', 950, 50, 80, 55, 0, 5.00, 1), -- UKRYTE
(12, 'Tajemnicze Curry', 'Indyjska', 600, 35, 60, 35, 1, 4.95, 2),
(13, 'Zapiekanka Szefa', 'Polska', 480, 15, 75, 22, 1, 4.90, 3),
(14, 'Wegański Bowl', 'Wegańska', 350, 12, 50, 15, 1, 5.00, 1),

-- GRUPA 3: "POPULARNE ŚREDNIAKI"
(20, 'Hot Dog Stacyjny', 'Fast Food', 420, 10, 45, 25, 1, 2.50, 2),
(21, 'Nuggetsy Mrożone', 'Fast Food', 380, 15, 30, 20, 0, 3.00, 3), -- UKRYTE
(22, 'Kebab Tani', 'Turecka', 900, 30, 80, 60, 1, 2.80, 1),
(23, 'Pizza Mrożona', 'Włoska', 700, 20, 90, 30, 1, 2.20, 2),
(24, 'Frytki Odgrzewane', 'Fast Food', 320, 4, 40, 18, 0, 1.50, 3), -- UKRYTE

-- GRUPA 4: "BITWA KATEGORII"
(30, 'Risotto Milanese', 'Włoska', 550, 12, 70, 25, 1, 4.00, 1),
(31, 'Tempura Krewetkowa', 'Japońska', 400, 20, 35, 28, 1, 4.00, 2),
(32, 'Tacos Beef', 'Meksykańska', 450, 22, 40, 20, 0, 4.00, 3), -- UKRYTE
(33, 'Kaczka po Pekińsku', 'Chińska', 650, 35, 20, 45, 1, 4.00, 1),

-- GRUPA 5: "ŚREDNIA PÓŁKA"
(40, 'Schabowy z Ziemniakami', 'Polska', 750, 35, 85, 30, 1, 4.20, 2),
(41, 'Burrito Grande', 'Meksykańska', 800, 30, 95, 35, 1, 4.10, 3),
(42, 'Pad Thai Kurczak', 'Tajska', 620, 28, 75, 22, 0, 4.30, 1), -- UKRYTE
(43, 'Butter Chicken', 'Indyjska', 700, 32, 25, 40, 1, 4.40, 2),
(44, 'Sajgonki', 'Wietnamska', 300, 10, 40, 15, 1, 3.90, 3),
(45, 'Zupa Pomidorowa', 'Polska', 250, 8, 30, 10, 0, 4.00, 1), -- UKRYTE
(46, 'Gnocchi Szpinakowe', 'Włoska', 500, 15, 80, 18, 1, 4.15, 2),
(47, 'Udon Wołowina', 'Japońska', 550, 30, 65, 15, 1, 4.25, 3),
(48, 'Quesadilla Serowa', 'Meksykańska', 600, 25, 55, 35, 1, 4.05, 1),
(49, 'Falafel Wrap', 'Wegańska', 480, 18, 60, 20, 0, 3.80, 2), -- UKRYTE

-- GRUPA 6: "DÓŁ RANKINGU"
(50, 'Rozgotowany Ryż', 'Chińska', 150, 3, 35, 1, 1, 1.50, 3),
(51, 'Przypalony Tost', 'Śniadania', 100, 2, 20, 2, 0, 1.20, 1), -- UKRYTE
(52, 'Zupa z Proszku', 'Instant', 80, 1, 15, 2, 1, 2.00, 2),
(53, 'Czerstwy Chleb', 'Piekarnia', 120, 4, 25, 1, 1, 1.00, 3),
(54, 'Woda z Kranu', 'Napoje', 0, 0, 0, 0, 1, 1.00, 1),

-- GRUPA 7: "MASA TESTOWA"
(60, 'Chili con Carne', 'Meksykańska', 550, 35, 40, 25, 1, 4.50, 2),
(61, 'Pho Bo', 'Wietnamska', 450, 30, 50, 15, 0, 4.60, 3), -- UKRYTE
(62, 'Fish and Chips', 'Brytyjska', 900, 25, 85, 50, 1, 3.50, 1),
(63, 'Musaka', 'Grecka', 650, 28, 45, 35, 1, 4.40, 2),
(64, 'Sałatka Cezar', 'Sałatki', 350, 25, 15, 20, 0, 3.90, 3), -- UKRYTE
(65, 'Stek Wołowy', 'Amerykańska', 600, 50, 0, 40, 1, 4.70, 1),
(66, 'Tiramisu', 'Włoska', 450, 8, 50, 25, 1, 4.80, 2),
(67, 'Miso Soup', 'Japońska', 80, 5, 10, 3, 1, 4.20, 3),
(68, 'Krewetki w Winie', 'Śródziemnomorska', 300, 25, 5, 20, 0, 4.60, 1), -- UKRYTE
(69, 'Bigos Staropolski', 'Polska', 400, 30, 20, 25, 1, 4.50, 2),
(70, 'Sernik', 'Desery', 380, 12, 45, 20, 1, 4.70, 3),
(71, 'Brownie', 'Desery', 420, 6, 55, 22, 1, 4.65, 1),
(72, 'Lody Waniliowe', 'Desery', 250, 4, 30, 15, 0, 4.10, 2), -- UKRYTE
(73, 'Gofry', 'Desery', 350, 8, 60, 12, 1, 3.80, 3),
(74, 'Naleśniki', 'Polska', 300, 10, 50, 10, 1, 4.30, 1),
(75, 'Tatar Wołowy', 'Polska', 200, 35, 2, 8, 1, 4.80, 2),
(76, 'Żurek', 'Polska', 320, 15, 25, 18, 0, 4.75, 3), -- UKRYTE
(77, 'Barszcz Czerwony', 'Polska', 100, 2, 20, 1, 1, 4.60, 1),
(78, 'Ceviche', 'Peruwiańska', 180, 25, 10, 5, 1, 4.90, 2),
(79, 'Paella', 'Hiszpańska', 600, 30, 75, 25, 1, 4.40, 3),
(80, 'Churros', 'Hiszpańska', 450, 6, 60, 25, 0, 4.20, 1), -- UKRYTE
(81, 'Gazpacho', 'Hiszpańska', 150, 3, 25, 8, 1, 3.90, 2),
(82, 'Tortilla Ziemniaczana', 'Hiszpańska', 350, 10, 45, 18, 1, 4.00, 3),
(83, 'Karkówka z Grilla', 'Polska', 650, 40, 5, 50, 1, 3.70, 1),
(84, 'Kiełbasa Śląska', 'Polska', 550, 25, 2, 45, 0, 3.50, 2), -- UKRYTE
(85, 'Oscypek z Żurawiną', 'Polska', 220, 15, 10, 12, 1, 4.80, 3),
(86, 'Placki Ziemniaczane', 'Polska', 450, 8, 60, 25, 1, 4.40, 1),
(87, 'Gołąbki', 'Polska', 380, 20, 40, 15, 1, 4.30, 2),
(88, 'Kopytka', 'Polska', 300, 8, 65, 5, 0, 4.10, 3), -- UKRYTE
(89, 'Pyzy z Mięsem', 'Polska', 320, 15, 55, 8, 1, 3.90, 1),

-- GRUPA 8: "PUŁAPKA NA ALGORYTM" (User JUŻ je zna)
-- Zauważ: ID 91 jest ukryte. Algorytm nie dość, że obniżyłby rangę za "znajomość", to tutaj w ogóle nie powinien go pokazać.
(90, 'TEST ULUBIONE - Pizza', 'Włoska', 850, 35, 110, 38, 1, 5.00, 2),
(91, 'TEST ULUBIONE - Sushi', 'Japońska', 450, 25, 65, 8, 0, 5.00, 3), -- UKRYTE
(92, 'TEST ULUBIONE - Burger', 'Amerykańska', 950, 50, 80, 55, 1, 5.00, 1),
(93, 'TEST ULUBIONE - Pasta', 'Włoska', 780, 30, 85, 45, 1, 4.90, 2),
(94, 'TEST ULUBIONE - Ramen', 'Japońska', 600, 28, 55, 30, 1, 4.90, 3),

-- GRUPA 9: RESZTA
(95, 'Kanapka z Serem', 'Śniadania', 280, 12, 30, 14, 1, 3.20, 1),
(96, 'Jajecznica', 'Śniadania', 220, 16, 2, 18, 0, 4.00, 2), -- UKRYTE
(97, 'Owsianka', 'Śniadania', 300, 10, 55, 6, 1, 3.50, 3),
(98, 'Smoothie Owocowe', 'Napoje', 180, 2, 40, 1, 1, 4.50, 1),
(99, 'Kawa Latte', 'Napoje', 150, 8, 12, 6, 0, 4.80, 2), -- UKRYTE
(100, 'Herbata Zielona', 'Napoje', 5, 0, 1, 0, 1, 4.20, 3);