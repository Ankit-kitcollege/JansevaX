package com.civicpulse.config;

import com.civicpulse.dto.ReportCreateDto;
import com.civicpulse.entity.Department;
import com.civicpulse.entity.User;
import com.civicpulse.enums.ReportCategory;
import com.civicpulse.enums.Role;
import com.civicpulse.enums.SeverityLevel;
import com.civicpulse.repository.DepartmentRepository;
import com.civicpulse.repository.ReportRepository;
import com.civicpulse.repository.UserRepository;
import com.civicpulse.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final ReportRepository reportRepository;
    private final PasswordEncoder passwordEncoder;
    private final ReportService reportService;

    @Override
    public void run(String... args) {
        if (departmentRepository.count() == 0) {
            seedDepartments();
        }
        if (userRepository.count() == 0) {
            seedUsersAndReports();
        } else {
            ensureOfficersExist();
        }
        ensureCitizensExist();
        if (reportRepository.count() == 0) {
            seedDefaultReports();
        }
    }

    private void seedDefaultReports() {
        User citizen = userRepository.findByEmail("citizen@civicpulse.org").orElseGet(() ->
            userRepository.findAll().stream().filter(u -> u.getRole() == Role.CITIZEN).findFirst().orElse(null)
        );
        if (citizen == null) return;

        ReportCreateDto r1 = new ReportCreateDto();
        r1.setTitle("Dangerous Deep Pothole on Main Avenue");
        r1.setDescription("Large 8-inch deep pothole near the central bus stop. Causing severe vehicle damage and traffic bottleneck during peak hours.");
        r1.setCategory(ReportCategory.POTHOLE);
        r1.setLatitude(28.6139);
        r1.setLongitude(77.2090);
        r1.setAddress("Main Ave near Central Metro Station, Sector 4");
        r1.setLandmark("Opposite Metro Gate 2");
        r1.setSeverity(SeverityLevel.HIGH);
        r1.setImageUrl("https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=60");
        reportService.createReport(r1, citizen);

        ReportCreateDto r2 = new ReportCreateDto();
        r2.setTitle("Pothole & Sunken Road Surface");
        r2.setDescription("Sunken road section 40 meters from metro station. Water pooling and causing dangerous skidding for two-wheelers.");
        r2.setCategory(ReportCategory.POTHOLE);
        r2.setLatitude(28.6142);
        r2.setLongitude(77.2093);
        r2.setAddress("Main Ave 40m North, Sector 4");
        r2.setLandmark("Near City Pharmacy");
        r2.setSeverity(SeverityLevel.HIGH);
        r2.setImageUrl("https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=60");
        reportService.createReport(r2, citizen);
    }

    private void ensureOfficersExist() {
        Department roadsDept = departmentRepository.findByCode("ROADS").orElse(null);

        userRepository.findByEmail("ankityadav100320@gmail.com").ifPresentOrElse(user -> {
            user.setRole(Role.DEPARTMENT_OFFICER);
            user.setPassword(passwordEncoder.encode("Ankit@45678912"));
            if (roadsDept != null) user.setDepartmentId(roadsDept.getId());
            userRepository.save(user);
        }, () -> {
            User officerAnkit = User.builder()
                    .name("Ankit Yadav (Field Officer)")
                    .email("ankityadav100320@gmail.com")
                    .password(passwordEncoder.encode("Ankit@45678912"))
                    .phone("+91 9876543210")
                    .role(Role.DEPARTMENT_OFFICER)
                    .departmentId(roadsDept != null ? roadsDept.getId() : null)
                    .build();
            userRepository.save(officerAnkit);
        });

        userRepository.findByEmail("officer.roads@civicpulse.org").ifPresentOrElse(user -> {
            user.setRole(Role.DEPARTMENT_OFFICER);
            user.setPassword(passwordEncoder.encode("officer123"));
            if (roadsDept != null) user.setDepartmentId(roadsDept.getId());
            userRepository.save(user);
        }, () -> {
            User officerRoads = User.builder()
                    .name("Officer Alex Rivera")
                    .email("officer.roads@civicpulse.org")
                    .password(passwordEncoder.encode("officer123"))
                    .phone("+1 800-555-0101")
                    .role(Role.DEPARTMENT_OFFICER)
                    .departmentId(roadsDept != null ? roadsDept.getId() : null)
                    .build();
            userRepository.save(officerRoads);
        });
    }

    private void ensureCitizensExist() {
        userRepository.findByEmail("citizen@jansevax.org").ifPresentOrElse(user -> {
            user.setRole(Role.CITIZEN);
            user.setPassword(passwordEncoder.encode("citizen123"));
            userRepository.save(user);
        }, () -> {
            User citizenJansevax = User.builder()
                    .name("Citizen User (JansevaX)")
                    .email("citizen@jansevax.org")
                    .password(passwordEncoder.encode("citizen123"))
                    .phone("+91 9876543211")
                    .role(Role.CITIZEN)
                    .build();
            userRepository.save(citizenJansevax);
        });

        userRepository.findByEmail("citizen@civicpulse.org").ifPresentOrElse(user -> {
            user.setRole(Role.CITIZEN);
            user.setPassword(passwordEncoder.encode("citizen123"));
            userRepository.save(user);
        }, () -> {
            User citizenCivic = User.builder()
                    .name("Citizen User")
                    .email("citizen@civicpulse.org")
                    .password(passwordEncoder.encode("citizen123"))
                    .phone("+1 800-555-0199")
                    .role(Role.CITIZEN)
                    .build();
            userRepository.save(citizenCivic);
        });
    }

    private void seedDepartments() {
        Department roads = Department.builder()
                .name("Roads & Bridges Department")
                .code("ROADS")
                .contactEmail("roads@civicpulse.gov")
                .description("Responsible for pothole repair, asphalt paving, road resurfacing, and bridge safety maintenance.")
                .build();

        Department sanitation = Department.builder()
                .name("Sanitation & Waste Management")
                .code("SANITATION")
                .contactEmail("sanitation@civicpulse.gov")
                .description("Manages garbage collection, street sweeping, hazardous waste removal, and public dump sites.")
                .build();

        Department water = Department.builder()
                .name("Water Supply & Sewerage Board")
                .code("WATER")
                .contactEmail("water@civicpulse.gov")
                .description("Maintains water mains, fixes pipeline leakages, handles sewage overflow, and stormwater drains.")
                .build();

        Department electrical = Department.builder()
                .name("Electrical & Public Lighting")
                .code("ELECTRICAL")
                .contactEmail("electrical@civicpulse.gov")
                .description("Maintains streetlights, traffic signals, power line safety, and municipal electrical grids.")
                .build();

        Department publicWorks = Department.builder()
                .name("Parks & Public Infrastructure")
                .code("PUBLIC_WORKS")
                .contactEmail("works@civicpulse.gov")
                .description("Handles fallen trees, public park equipment, damaged sidewalks, and public structure safety.")
                .build();

        departmentRepository.saveAll(Arrays.asList(roads, sanitation, water, electrical, publicWorks));
    }

    private void seedUsersAndReports() {
        Department roadsDept = departmentRepository.findByCode("ROADS").orElse(null);
        Department sanitationDept = departmentRepository.findByCode("SANITATION").orElse(null);

        User admin = User.builder()
                .name("System Administrator")
                .email("admin@civicpulse.org")
                .password(passwordEncoder.encode("admin123"))
                .phone("+1 800-555-0100")
                .role(Role.ADMIN)
                .build();

        User officerAnkit = User.builder()
                .name("Ankit Yadav (Field Officer)")
                .email("ankityadav100320@gmail.com")
                .password(passwordEncoder.encode("Ankit@45678912"))
                .phone("+91 9876543210")
                .role(Role.DEPARTMENT_OFFICER)
                .departmentId(roadsDept != null ? roadsDept.getId() : null)
                .build();

        User officerRoads = User.builder()
                .name("Officer Alex Rivera")
                .email("officer.roads@civicpulse.org")
                .password(passwordEncoder.encode("officer123"))
                .phone("+1 800-555-0101")
                .role(Role.DEPARTMENT_OFFICER)
                .departmentId(roadsDept != null ? roadsDept.getId() : null)
                .build();

        User officerSanitation = User.builder()
                .name("Officer Maya Lin")
                .email("officer.sanitation@civicpulse.org")
                .password(passwordEncoder.encode("officer123"))
                .phone("+1 800-555-0102")
                .role(Role.DEPARTMENT_OFFICER)
                .departmentId(sanitationDept != null ? sanitationDept.getId() : null)
                .build();

        User citizen = User.builder()
                .name("Citizen User")
                .email("citizen@civicpulse.org")
                .password(passwordEncoder.encode("citizen123"))
                .phone("+1 800-555-0199")
                .role(Role.CITIZEN)
                .build();

        userRepository.saveAll(Arrays.asList(admin, officerAnkit, officerRoads, officerSanitation, citizen));

        // Create initial realistic civic reports
        ReportCreateDto r1 = new ReportCreateDto();
        r1.setTitle("Dangerous Deep Pothole on Main Avenue");
        r1.setDescription("Large 8-inch deep pothole near the central bus stop. Causing severe vehicle damage and traffic bottleneck during peak hours.");
        r1.setCategory(ReportCategory.POTHOLE);
        r1.setLatitude(28.6139);
        r1.setLongitude(77.2090);
        r1.setAddress("Main Ave near Central Metro Station, Sector 4");
        r1.setLandmark("Opposite Metro Gate 2");
        r1.setSeverity(SeverityLevel.HIGH);
        r1.setImageUrl("https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=60");
        reportService.createReport(r1, citizen);

        ReportCreateDto r2 = new ReportCreateDto();
        r2.setTitle("Pothole & Sunken Road Surface");
        r2.setDescription("Sunken road section 40 meters from metro station. Water pooling and causing dangerous skidding for two-wheelers.");
        r2.setCategory(ReportCategory.POTHOLE);
        r2.setLatitude(28.6142);
        r2.setLongitude(77.2093);
        r2.setAddress("Main Ave 40m North, Sector 4");
        r2.setLandmark("Near City Pharmacy");
        r2.setSeverity(SeverityLevel.HIGH);
        r2.setImageUrl("https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=60");
        reportService.createReport(r2, citizen);

        ReportCreateDto r3 = new ReportCreateDto();
        r3.setTitle("Overflowing Garbage Dumpster Blocking Sidewalk");
        r3.setDescription("Uncollected garbage heap overflowing onto pedestrian walk path for 3 days. Foul odor and health hazard.");
        r3.setCategory(ReportCategory.GARBAGE);
        r3.setLatitude(28.6180);
        r3.setLongitude(77.2150);
        r3.setAddress("Market Road, Block B");
        r3.setLandmark("Behind Community Supermarket");
        r3.setSeverity(SeverityLevel.CRITICAL);
        r3.setImageUrl("https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=60");
        reportService.createReport(r3, citizen);

        ReportCreateDto r4 = new ReportCreateDto();
        r4.setTitle("Broken Streetlight & Dark Intersection");
        r4.setDescription("Three continuous streetlights non-functional creating dangerous dark zone for pedestrians at night.");
        r4.setCategory(ReportCategory.STREETLIGHT);
        r4.setLatitude(28.6110);
        r4.setLongitude(77.2020);
        r4.setAddress("7th Cross Street, Park View");
        r4.setLandmark("Near Public Library");
        r4.setSeverity(SeverityLevel.MEDIUM);
        r4.setImageUrl("https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=60");
        reportService.createReport(r4, citizen);

        ReportCreateDto r5 = new ReportCreateDto();
        r5.setTitle("Stormwater Drain Blockage & Waterlogging");
        r5.setDescription("Clogged drainage outlet causing waterlogging after minor rain. Water entering nearby shops.");
        r5.setCategory(ReportCategory.DRAINAGE);
        r5.setLatitude(28.6200);
        r5.setLongitude(77.2200);
        r5.setAddress("Commercial Belt, Gate 4");
        r5.setLandmark("In front of National Bank");
        r5.setSeverity(SeverityLevel.CRITICAL);
        r5.setImageUrl("https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=600&auto=format&fit=crop&q=60");
        reportService.createReport(r5, citizen);

        ReportCreateDto r6 = new ReportCreateDto();
        r6.setTitle("GARBAGE Reported at Mangla Vihar Ist Kanpur Nagar");
        r6.setDescription("Today I found the garbage dumped in the middle of the road of Kanpur. Immediate sanitation cleanup needed.");
        r6.setCategory(ReportCategory.GARBAGE);
        r6.setLatitude(26.4499);
        r6.setLongitude(80.3319);
        r6.setAddress("Mangla Vihar Ist Kanpur Nagar, Uttar Pradesh, 208015, India");
        r6.setLandmark("Near Main Kanpur Road");
        r6.setSeverity(SeverityLevel.HIGH);
        r6.setImageUrl("https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=60");
        reportService.createReport(r6, citizen);

        ReportCreateDto r7 = new ReportCreateDto();
        r7.setTitle("Fallen Tree & Sidewalk Obstruction");
        r7.setDescription("Large tree branch fallen across sidewalk blocking pedestrian access and street traffic.");
        r7.setCategory(ReportCategory.FALLEN_TREE);
        r7.setLatitude(26.4670);
        r7.setLongitude(80.3500);
        r7.setAddress("Mall Road, Kanpur");
        r7.setLandmark("Near Mall Road Crossing");
        r7.setSeverity(SeverityLevel.MEDIUM);
        r7.setImageUrl("https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=600&auto=format&fit=crop&q=60");
        reportService.createReport(r7, citizen);
    }
}

