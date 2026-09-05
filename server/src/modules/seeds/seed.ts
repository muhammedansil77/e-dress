import { Database } from '../../config/database';
import { AdminModel } from '../admins/admin.model';
import { CategoryModel } from '../categories/category.model';
import { BrandModel } from '../brands/brand.model';
import { SizeModel } from '../sizes/size.model';
import { ColorModel } from '../colors/color.model';
import { ProductModel } from '../products/product.model';
import { AdminRole, ALL_PERMISSIONS } from '../../common/constants';
import { PasswordUtils } from '../../common/utils/password.utils';
import { slugify } from '../../common/utils/slugify';

async function runSeed() {
  console.log('🌱 Starting Database Seeder...');
  await Database.connect();

  // 1. Seed Super Admin
  const adminEmail = 'admin@apparels.com';
  const existingAdmin = await AdminModel.findOne({ email: adminEmail });

  if (!existingAdmin) {
    console.log('👤 Creating default Super Admin account...');
    const hashedPassword = await PasswordUtils.hash('Admin@123456');

    await AdminModel.create({
      name: 'Super Administrator',
      email: adminEmail,
      password: hashedPassword,
      role: AdminRole.SUPER_ADMIN,
      customPermissions: ALL_PERMISSIONS,
      isActive: true,
    });
    console.log(`✅ Super Admin created: ${adminEmail} / Admin@123456`);
  } else {
    console.log(`ℹ️ Super Admin already exists (${adminEmail})`);
  }

  // 2. Seed Categories
  const categoryCount = await CategoryModel.countDocuments();
  if (categoryCount === 0) {
    console.log('👗 Seeding initial Apparel Categories hierarchy...');

    const categoryTaxonomy = [
      {
        name: 'Women',
        description: 'Ethnic, casual, formal and party wear for modern women',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
        displayOrder: 1,
        children: [
          { name: 'Sarees', description: 'Traditional silk, chiffon, and cotton sarees', displayOrder: 1 },
          { name: 'Kurtis', description: 'Designer kurtas, tunics, and ethnic sets', displayOrder: 2 },
          { name: 'Dresses', description: 'Maxi dresses, bodycon, midi, and sundresses', displayOrder: 3 },
          { name: 'Tops', description: 'Casual tees, blouses, and crop tops', displayOrder: 4 },
          { name: 'Jeans', description: 'High-waist, slim, flared, and skinny denim', displayOrder: 5 },
          { name: 'Skirts', description: 'Pleated, A-line, denim, and pencil skirts', displayOrder: 6 },
        ],
      },
      {
        name: 'Men',
        description: 'Sharp suits, casual tees, denim and streetwear for men',
        image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800&q=80',
        displayOrder: 2,
        children: [
          { name: 'Shirts', description: 'Formal, casual linen, and printed shirts', displayOrder: 1 },
          { name: 'T-Shirts', description: 'Crew neck, polo, and graphic tees', displayOrder: 2 },
          { name: 'Jeans', description: 'Straight, slim fit, and distressed jeans', displayOrder: 3 },
          { name: 'Trousers', description: 'Chinos, formal slacks, and cargo pants', displayOrder: 4 },
          { name: 'Jackets', description: 'Bomber, denim, leather, and blazer jackets', displayOrder: 5 },
        ],
      },
      {
        name: 'Kids',
        description: 'Comfortable, playful and cute outfits for boys, girls and toddlers',
        image: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=800&q=80',
        displayOrder: 3,
        children: [
          { name: 'Boys', description: 'Shirts, shorts, sets, and denim for boys', displayOrder: 1 },
          { name: 'Girls', description: 'Frocks, tops, skirts, and ethnic wear for girls', displayOrder: 2 },
          { name: 'Baby', description: 'Soft onesies, rompers, and infant sets', displayOrder: 3 },
        ],
      },
    ];

    for (const rootCat of categoryTaxonomy) {
      const rootSlug = slugify(rootCat.name);
      const createdRoot = await CategoryModel.create({
        name: rootCat.name,
        slug: rootSlug,
        description: rootCat.description,
        image: rootCat.image,
        parentId: null,
        status: 'ACTIVE',
        displayOrder: rootCat.displayOrder,
        seoTitle: `${rootCat.name} Apparel & Clothing Collection`,
        seoDescription: rootCat.description,
        isDeleted: false,
      });

      console.log(`  📁 Root Category: ${createdRoot.name}`);

      for (const subCat of rootCat.children) {
        const subSlug = slugify(`${rootCat.name}-${subCat.name}`);
        await CategoryModel.create({
          name: subCat.name,
          slug: subSlug,
          description: subCat.description,
          image: '',
          parentId: createdRoot._id,
          status: 'ACTIVE',
          displayOrder: subCat.displayOrder,
          seoTitle: `${subCat.name} for ${rootCat.name} - Online Collection`,
          seoDescription: subCat.description,
          isDeleted: false,
        });
        console.log(`    ↳ 📂 Subcategory: ${subCat.name} (${subSlug})`);
      }
    }

    console.log('✅ Categories seeded successfully.');
  }

  // 3. Seed Brands
  const brandCount = await BrandModel.countDocuments();
  if (brandCount === 0) {
    console.log('🏷️ Seeding Brands...');
    const brandsData = [
      { name: 'Zara', slug: 'zara', description: 'Contemporary international fashion & couture' },
      { name: 'FabIndia', slug: 'fabindia', description: 'Authentic handcrafted traditional and ethnic apparel' },
      { name: 'H&M', slug: 'hm', description: 'Trendy, sustainable everyday fashion essentials' },
      { name: 'Biba', slug: 'biba', description: 'Contemporary Indian ethnic wear and kurtis' },
      { name: 'Allen Solly', slug: 'allen-solly', description: 'Modern casual and formal apparel for men & women' },
    ];
    for (const b of brandsData) {
      await BrandModel.create({ ...b, status: 'ACTIVE', isDeleted: false });
    }
    console.log('✅ Brands seeded.');
  }

  // 4. Seed Sizes
  const sizeCount = await SizeModel.countDocuments();
  if (sizeCount === 0) {
    console.log('📏 Seeding Sizes...');
    const sizes = [
      { name: 'XS', code: 'XS', sortOrder: 1 },
      { name: 'S', code: 'S', sortOrder: 2 },
      { name: 'M', code: 'M', sortOrder: 3 },
      { name: 'L', code: 'L', sortOrder: 4 },
      { name: 'XL', code: 'XL', sortOrder: 5 },
      { name: 'XXL', code: 'XXL', sortOrder: 6 },
      { name: 'XXXL', code: 'XXXL', sortOrder: 7 },
    ];
    for (const s of sizes) {
      await SizeModel.create({ ...s, status: 'ACTIVE' });
    }
    console.log('✅ Sizes seeded.');
  }

  // 5. Seed Colors
  const colorCount = await ColorModel.countDocuments();
  if (colorCount === 0) {
    console.log('🎨 Seeding Colors...');
    const colors = [
      { name: 'Midnight Black', hexCode: '#09090b' },
      { name: 'Pure White', hexCode: '#ffffff' },
      { name: 'Crimson Red', hexCode: '#e11d48' },
      { name: 'Royal Blue', hexCode: '#2563eb' },
      { name: 'Emerald Green', hexCode: '#059669' },
      { name: 'Blush Pink', hexCode: '#ec4899' },
      { name: 'Mustard Yellow', hexCode: '#eab308' },
      { name: 'Navy Blue', hexCode: '#1e3a8a' },
    ];
    for (const c of colors) {
      await ColorModel.create({ ...c, status: 'ACTIVE' });
    }
    console.log('✅ Colors seeded.');
  }

  // 6. Seed Sample Products with Variants
  const productCount = await ProductModel.countDocuments();
  if (productCount === 0) {
    console.log('👗 Seeding Sample Dresses & Products with Variants...');
    const dressesCat = await CategoryModel.findOne({ slug: 'women-dresses' });
    const womenCat = await CategoryModel.findOne({ slug: 'women' });
    const kurtisCat = await CategoryModel.findOne({ slug: 'women-kurtis' });
    const zaraBrand = await BrandModel.findOne({ slug: 'zara' });
    const bibaBrand = await BrandModel.findOne({ slug: 'biba' });

    if (dressesCat && womenCat) {
      await ProductModel.create({
        name: 'Floral Print Georgette Maxi Dress',
        slug: 'floral-print-georgette-maxi-dress',
        sku: 'DR-FLR-001',
        description: 'Breeze through summer with this tiered georgette floral maxi dress featuring flutter sleeves and a flattering cinched waistline.',
        shortDescription: 'Chic tiered floral dress with flutter sleeves.',
        categoryId: womenCat._id,
        subcategoryId: dressesCat._id,
        brandId: zaraBrand?._id || null,
        images: [
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80',
          'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
        ],
        price: 1499,
        discountPrice: 1299,
        tax: 5,
        status: 'ACTIVE',
        isFeatured: true,
        isNewArrival: true,
        isBestseller: true,
        tags: ['dress', 'maxi', 'floral', 'summer', 'party'],
        seoTitle: 'Floral Print Georgette Maxi Dress | Haute Apparel',
        seoDescription: 'Shop our signature floral maxi dress in red and navy.',
        variants: [
          {
            sku: 'DR-FLR-RED-S',
            color: { name: 'Crimson Red', hexCode: '#e11d48' },
            size: 'S',
            stock: 12,
            price: 1499,
            discountPrice: 1299,
            status: 'ACTIVE',
          },
          {
            sku: 'DR-FLR-RED-M',
            color: { name: 'Crimson Red', hexCode: '#e11d48' },
            size: 'M',
            stock: 15,
            price: 1499,
            discountPrice: 1299,
            status: 'ACTIVE',
          },
          {
            sku: 'DR-FLR-BLU-M',
            color: { name: 'Royal Blue', hexCode: '#2563eb' },
            size: 'M',
            stock: 8,
            price: 1599,
            discountPrice: 1399,
            status: 'ACTIVE',
          },
          {
            sku: 'DR-FLR-BLU-L',
            color: { name: 'Royal Blue', hexCode: '#2563eb' },
            size: 'L',
            stock: 6,
            price: 1599,
            discountPrice: 1399,
            status: 'ACTIVE',
          },
        ],
        totalStock: 41,
        isDeleted: false,
      });

      console.log('  👗 Seeded: Floral Print Georgette Maxi Dress (4 variants)');
    }

    if (kurtisCat && womenCat) {
      await ProductModel.create({
        name: 'Embroidered Silk Blend Festive Kurti Set',
        slug: 'embroidered-silk-blend-festive-kurti-set',
        sku: 'KT-EMB-102',
        description: 'Exquisite silk blend A-line kurti with intricate zardozi hand embroidery, paired with straight trousers and chiffon dupatta.',
        shortDescription: 'Luxury silk kurti set with embroidery.',
        categoryId: womenCat._id,
        subcategoryId: kurtisCat._id,
        brandId: bibaBrand?._id || null,
        images: [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
        ],
        price: 2499,
        discountPrice: 1999,
        tax: 5,
        status: 'ACTIVE',
        isFeatured: true,
        isNewArrival: false,
        isBestseller: true,
        tags: ['ethnic', 'kurti', 'silk', 'festive', 'wedding'],
        seoTitle: 'Embroidered Silk Blend Festive Kurti Set | Haute Apparel',
        seoDescription: 'Designer silk kurti set with dupatta for wedding & festive celebrations.',
        variants: [
          {
            sku: 'KT-EMB-PNK-M',
            color: { name: 'Blush Pink', hexCode: '#ec4899' },
            size: 'M',
            stock: 10,
            price: 2499,
            discountPrice: 1999,
            status: 'ACTIVE',
          },
          {
            sku: 'KT-EMB-GRN-L',
            color: { name: 'Emerald Green', hexCode: '#059669' },
            size: 'L',
            stock: 5,
            price: 2499,
            discountPrice: 1999,
            status: 'ACTIVE',
          },
        ],
        totalStock: 15,
        isDeleted: false,
      });

      console.log('  🥻 Seeded: Embroidered Silk Blend Festive Kurti Set (2 variants)');
    }
  }

  console.log('🎉 Seeding finished successfully!');
  await Database.disconnect();
}

runSeed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
